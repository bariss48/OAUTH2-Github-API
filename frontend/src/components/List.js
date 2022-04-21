import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

const List = (props) => {
  const { repos } = props;
  var link = ''
  if (!repos || repos.length === 0) return <p>No repository</p>;
  return (
    <ul>
      <h2 className='list-head'>Public Repositories</h2>
      {repos.map((repo) => {
        return (
          <li key={repo.id} className='list'>
            <span className='repo-text'>{repo.name} </span>
            <span className='repo-description'>{repo.description}</span>
            <a href={repo.html_url}>
            <button>goes to repo</button>
            </a>
            <a href={`https://github.com/${repo.owner.login}/${repo.name}/archive/refs/heads/master.zip`}>
            <button>download repo</button>
            </a>
          </li>
        );
      })}
    </ul>
  );
};
export default List;
