import {User} from "@heroui/user";


function Comment(){
    return(
        <div className="m-5">
             <User avatarProps={{ src: "https://i.pravatar.cc/150?u=a04258114e29026702d",}} name="Jane Doe"/>
            <p className="">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut </p>
        </div>
    )
}

export default Comment;