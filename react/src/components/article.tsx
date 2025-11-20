import { Divider } from "@heroui/divider";
import { Link } from "react-router-dom";

function Article(props: any){
    return (
        <article className="mt-5">
        
        <Link to={props.href}  target="_blank" rel="noopener noreferrer">
        <p className="text-2xl underline opacity-80">{props.tittle}</p>
         <p className="opacity-60 my-3 text-lg no-underline w-2/3">{props.summary}</p>
        </Link>
       
        <Divider />
        </article>

    );
}

export default Article;