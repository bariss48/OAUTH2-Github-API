import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import List from './components/List';
import withListLoading from './components/WithListLoading';

const GITHUB_CLIENT_ID = "06b2ef8c25f1d388be4e";
const gitHubRedirectURL = "http://localhost:4000/api/auth/github";
const path = "/";

function App() {
  const [user, setUser] = useState();
  let repos_url = useState();
  const ListLoading = withListLoading(List);
  const [AppState, setAppState] = useState({
    loading: false,
    repos: null,
  });
  useEffect(() => {
    (async function () {
      let usr = await axios
        .get(`http://localhost:4000/api/me`, {
          withCredentials: true,
        })
        .then((res) => res.data);  
      setUser(usr);
      setAppState({ loading: true });
      axios.get(`https://api.github.com/users/${usr.login}/repos`).then((repos) => {
      const allRepos = repos.data;
      setAppState({ loading: false, repos: allRepos });
    });
    })();
  }, []);
  
  return (
    <div className="App">
      {!user ? (
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${gitHubRedirectURL}?path=${path}&scope=user:email`}
        >
          <button className='button'>LOGIN WITH GITHUB</button>
        </a>
      ) : (               
         <div className='App'>
         <div className='container'>
           <h1>Github Profile ({user.login})</h1>
           <ul>
             <li><h4>Name: {user.name}</h4></li>
             <li><h4>Bio: {user.bio}</h4></li>
             <li><h4>Followers: {user.followers}</h4></li>
             <li><h4>Repositories: {user.public_repos}</h4></li>
             <li><h4>Gists: {user.public_gists}</h4></li>
             <li><h4>Location: {user.location}</h4></li>
             <li><h4>Created at: {user.created_at}</h4></li>
           </ul>
         <img src={user.avatar_url}></img>
         </div>
         <div className='repo-container'>
         <ListLoading isLoading={AppState.loading} repos={AppState.repos} />
        </div>
    </div>
      )}            
    </div>
  );
}

export default App;
