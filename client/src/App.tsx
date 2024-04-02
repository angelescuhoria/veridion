import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import "./App.css";
import logo from "./logo.svg";

export const App: React.FC = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:3001/api/getdata");
      return data;
    },
  });

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error!</h1>;

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
};
