import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
  };
}
export function useBlog({ id }: { id: string }) {
  const [blog, setBlog] = useState<Blog[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      axios.get(`${BACKEND_URL}/api/v1/book/blog/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((response) => {
        setBlog(response.data);
        setLoading(false);
      })
  }, [id]);

  return { loading, blog };
}

export const useBlogs=()=> {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
      try {
        axios.get(`${BACKEND_URL}/api/v1/book/blog`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((response) =>{
          setBlogs(response.data);
          setLoading(false);
        })
      } catch (e) {
        alert("Error occured while fetching blogs. Please try again.");
      }
  }, []);

  return { loading, blogs };
}