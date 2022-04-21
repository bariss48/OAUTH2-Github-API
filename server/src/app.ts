import express, { Request, Response } from "express";
import querystring from "querystring";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import cookieParser from "cookie-parser";
import axios from "axios";
import cors from "cors";
import fs from "fs";

const app = express();

app.use(cookieParser());

const GITHUB_CLIENT_ID = "";
const GITHUB_CLIENT_SECRET = "";
const secret = "shhhhhhhhhhhh";
const COOKIE_NAME = "github-jwt";
const gitHubRedirectURL = "http://localhost:4000/api/auth/github";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: string;
  email: null;
  hireable: null;
  bio: null;
  twitter_username: null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

async function getGitHubUser({ code }: { code: string }): Promise<GitHubUser> {
  const githubToken = await axios
    .post(
      `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
    )
    .then((res) => res.data)

    .catch((error) => {
      throw error;
    });

  const decoded = querystring.parse(githubToken);

  const accessToken = decoded.access_token;

  return axios
    .get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error getting user from GitHub`);
      throw error;
    });
}

app.get("/api/auth/github", async (req: Request, res: Response) => {
  const code = get(req, "query.code");
  const path = get(req, "query.path", "/");

  if (!code) {
    throw new Error("No code!");
  }

  const gitHubUser = await getGitHubUser({ code });

  const token = jwt.sign(gitHubUser, secret);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    domain: "localhost",
  });

  res.redirect(`http://localhost:3000${path}`);
});

app.get("/api/me", (req: Request, res: Response) => {
  const cookie = get(req, `cookies[${COOKIE_NAME}]`);
  try {
    const decode = jwt.verify(cookie, secret);
    console.log(decode);
    return res.send(decode);
  } catch (e) {
    return res.send(null);
  }
});


app.get("/user", (req: Request, res: Response) => {
  const cookie = get(req, `cookies[${COOKIE_NAME}]`);
  try {
    const decode = jwt.verify(cookie, secret);
    console.log(decode);
    let data = JSON.stringify(decode)
    fs.writeFileSync('user.json',data);
    return res.json({
      status:201,
      decode
    });
  } catch (e) {
    return res.send(null);
  }
});

app.get('/login/github', async (req: Request, res: Response) => {
  const path = get(req, "query.path", "/");
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${gitHubRedirectURL}?path=${path}&scope=user:email`);
});

app.get("/projects", (req: Request, res: Response) => {
  const cookie = get(req, `cookies[${COOKIE_NAME}]`);
  try {
    let repositorys;
    const decode = jwt.verify(cookie, secret);
    console.log(decode);
    var parse = JSON.parse(JSON.stringify(decode));
    console.log(parse.repos_url);
    console.log(parse.login);
    const response = axios.get(`https://api.github.com/users/${parse.login}/repos`,{
      headers: { Authorization: `${cookie}`, Accept: 'text/html, application/json, text/plain, */*' },
    }).then((repos) => {
      repositorys = repos.data;
     }).catch(err =>{
       console.log(err);
     })
    const url = ` "https://api.github.com/users/${parse.login}/repos" `
    console.log(url);
    return res.json({
      status:201,
      repositorys
    });
  } catch (e) {
    return res.send(null);
  }
});

app.listen(4000, () => {
  console.log("Server is listening");
});
