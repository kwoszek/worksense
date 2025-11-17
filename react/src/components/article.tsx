import { Divider } from "@heroui/divider";
import { Link } from "react-router-dom";

function Article(props){
    return (
        <article className="mt-5">
        
        <Link to={props.href} className="text-2xl underline ">{props.tittle}</Link>
        <p className="opacity-60 my-3">{props.summary}</p>
        <Divider />
        </article>

    );
}

export default Article;