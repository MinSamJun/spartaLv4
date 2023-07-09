const express = require("express");
const jwt = require("jsonwebtoken");
const { Users, News, NewsLiked } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const { json, useInflection } = require("sequelize");
const router = express.Router();

// 로그인 API
router.post("/api/login", async (req, res) => {
  // id와 pw를 body로 입력받음
  const { id, password } = req.body;
  // id로 일치하는 유저 검색
  const user = await Users.findOne({ where: { id } });
  console.log(user);
  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 아이디입니다." });
  } else if (user.password !== password) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }
  // jwt 생성
  const token = jwt.sign(
    {
      userId: user.userId, // userId 할당
    },
    "customized_secret_key"
  );
  // 쿠키 발급
  res.cookie("authorization", `Bearer ${token}`);
  // userID 전송
  return res.status(200).json({ message: "로그인 성공" });
});

// 로그인 체크 API
router.get("/api/logincheck", authMiddleware, async (req, res) => {
  return res.status(201).json({ userInfo: res.locals.user });
});

// 로그아웃 API
router.post("/api/logout", authMiddleware, async (req, res) => {
  // 쿠키 삭제
  return res.cookie("authorization", "").json({ message: "로그아웃 완료" });
});

// 뉴스 불러오기 API (최신순)
router.get("/api/getnews", async (req, res) => {
  const desc = "desc";
  newsCall(desc, res)
});

// 뉴스 불러오기 API (과거순)
router.get("/api/getoldnews", async (req, res) => {
  const asc = "asc";
  newsCall(asc, res)
});

async function newsCall(order, res) {
  const newsList = await News.findAll({
    attributes: [
      "newsId",
      "UserId",
      "title",
      "content",
      "img",
      "category",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Users,
        attributes: ["nickname"],
      },
      {
        model: NewsLiked,
        attributes: [],
      },
    ],
    order: [["createdAt", order]],
  });

  console.log(newsList)

  // 각 뉴스의 newsId 값을 가져와서 NewsLikeds에서 해당 newsId 값을 가진 데이터 개수를 세기
  for (const news of newsList) {
    const count = await NewsLiked.count({
      where: {
        newsId: news.newsId,
      },
    });
    news.dataValues.newsLikedCount = count;
  }

  // 중복 제거 코드 추가
  const uniqueNewsList = newsList.filter((news, index, self) =>
    self.findIndex((item) => item.newsId === news.newsId) === index
  );

  const newsWithLikes = uniqueNewsList.map((news) => {
    // console.log(news.dataValues.newsId, news.dataValues.newsLikedCount);
    return {
      ...news.dataValues,
      newsLikedCount: news.dataValues.newsLikedCount,
    };
  });

  res.status(200).json({ news: newsWithLikes });
};


//  좋아요로 찾아오기
router.get("/api/getnewsLiked", async (req, res) => {
  console.log("좋아요 찾기 시작");

  const { userId } = req.query; // userId 값을 쿼리 파라미터로부터 가져옴
  console.log("userId", typeof userId, userId);

  const newsLikedList = await NewsLiked.findAll({
    attributes: ["newsId"],
    order: [["createdAt", "ASC"]],
    where: { userId: userId } // userId를 사용하여 where 절을 구성
  });

  // newsId만 추출하여 배열로 저장
  const newsIds = newsLikedList.map((item) => item.newsId);

  const newsList = await News.findAll({
    attributes: [
      "newsId",
      "UserId",
      "title",
      "content",
      "img",
      "category",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Users,
        attributes: ["nickname"],
      },
      {
        model: NewsLiked,
        attributes: [],
      },
    ],
    where: { newsId: newsIds }
  });

  // 중복 제거 코드 추가
  const uniqueNewsList = newsList.filter((news, index, self) =>
    self.findIndex((item) => item.newsId === news.newsId) === index
  );

  // 각 뉴스의 newsId 값을 가져와서 NewsLikeds에서 해당 newsId 값을 가진 데이터 개수를 세기
  for (const news of uniqueNewsList) {
    const count = await NewsLiked.count({
      where: {
        newsId: news.newsId,
      },
    });
    news.dataValues.newsLikedCount = count;
  }

  const newsWithLikes = uniqueNewsList.map((news) => {
    return {
      ...news.dataValues,
      newsLikedCount: news.dataValues.newsLikedCount,
    };
  });


  const newsWithLikesSorted = newsWithLikes.sort((a, b) => {
    return b.newsLikedCount - a.newsLikedCount;
  });

  res.status(200).json({ news: newsWithLikesSorted });
});



module.exports = router;
