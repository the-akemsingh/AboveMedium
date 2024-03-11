import { useBlogs } from '../Hooks/index';
import { BlogCard } from '../components/BlogCard';
import { BlogSkeleton } from '../components/BlogSkeleton';
import { Appbar } from '../components/Appbar';
import { useNavigate } from 'react-router-dom';

export const Blogs = () => {
    const { loading, blogs } = useBlogs();
    const navigate = useNavigate();

    if (loading) {
        return <div>
            <Appbar></Appbar>
            <div className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }
  
    if (!localStorage.getItem("token")) {
        navigate("/signin");
    }
    return (
        <div>
            <Appbar></Appbar>

            <div className=' flex justify-center'>
                <div>
                    {blogs?.map((blog) => (
                        <BlogCard id={blog.id} title={blog.title} content={blog.content} authorName={blog.author.name || "Anonumous"}  />
                    ))}
                </div>
            </div>
        </div>
    );
}