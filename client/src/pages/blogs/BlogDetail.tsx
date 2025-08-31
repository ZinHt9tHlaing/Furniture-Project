import { useParams } from "react-router";

const BlogDetail = () => {
  const { postId } = useParams();

  return <div>BlogDetail : {postId}</div>;
};

export default BlogDetail;
