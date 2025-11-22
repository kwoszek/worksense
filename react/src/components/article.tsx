import { Divider } from "@heroui/divider";
import { Link } from "react-router-dom";

function Article(props: any){
    return (
        <article className="mt-5">
        
        <Link to={props.href}  target="_blank" rel="noopener noreferrer">
        <p className="font-light  opacity-100 mb-2  decoration-orange-200 hover:underline hover:bg-[#FFFFCC53] ">{props.tittle}</p>
         
        </Link>
       
        <Divider />
        </article>

    );
}

export default Article;