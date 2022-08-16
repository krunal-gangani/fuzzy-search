import { useState, useEffect } from "react";
import axios from "axios";
import SearchIcon from "@material-ui/icons/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { TextField } from "@mui/material";
import Fuse from "fuse.js";
import "./app.css";
import Item from "./components/Item";

function App() {
  const [text, setText] = useState("");
  const [todo, setTodo] = useState([]);
  const [searchData, setSearchData] = useState(todo);
  const [isUpdating, setUpdating] = useState("");

  const searchItem = (query) => {
    if (!query) {
      setSearchData(todo);
      return;
    }
    const fuse = new Fuse(todo, {
      keys: ["text"],
    });
    const result = fuse.search(query);
    const finalResult = [];
    if (result.length) {
      result.forEach((item) => {
        finalResult.push(item.item);
      });
      setSearchData(finalResult);
    } else {
      setSearchData([]);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/get-todo")
      .then((res) => {
        setSearchData(res.data);
        setTodo(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const addUpdateTodo = () => {
    if (isUpdating === "") {
      axios
        .post("http://localhost:5000/save-todo", { text })
        .then((res) => {
          console.log(res.data);
          setText("");
        })
        .catch((err) => console.log(err));
    } else {
      axios
        .post("http://localhost:5000/update-todo", { _id: isUpdating, text })
        .then((res) => {
          console.log(res.data);
          setText("");
          setUpdating("");
        })
        .catch((err) => console.log(err));
    }
  };

  const deleteTodo = (_id) => {
    axios
      .post("http://localhost:5000/delete-todo", { _id })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  };

  const updateTodo = (_id, text) => {
    setUpdating(_id);
    setText(text);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Fuzzy Search</h1>
        <br />
        <TextField
          placeholder="Search"
          type="search"
          variant="outlined"
          fullWidth
          size="small"
          onChange={(e) => searchItem(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <br />
        <div className="top">
          <input
            type="text"
            placeholder="Add new item..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="add" onClick={addUpdateTodo}>
            {isUpdating ? "Update" : "Add"}
          </div>
        </div>
        <br />
        <div className="list">
          {searchData.map((item) => (
            <Item
              key={item._id}
              text={item.text}
              remove={() => deleteTodo(item._id)}
              update={() => updateTodo(item._id, item.text)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
