import {User} from "@heroui/user";
import {Button, ButtonGroup} from "@heroui/button";
import Comment from "@/components/comment";

function Post(){
    return(
        <div className="m-5">
             <User avatarProps={{ src: "https://i.pravatar.cc/150?u=a04258114e29026702d",}} name="Jane Doe"/>
            <p className="">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut finibus porttitor semper. Phasellus feugiat aliquam nunc non tincidunt. Nullam pellentesque diam sit amet fringilla sagittis. Ut malesuada vestibulum porttitor. Aenean tempor, erat non vehicula tincidunt, eros velit condimentum neque, fermentum aliquet eros erat vel diam. Vivamus consectetur ipsum non rhoncus sollicitudin. Sed dictum arcu purus, sed tincidunt erat ullamcorper nec. Nulla ac elementum lacus. Suspendisse</p>
        
            <div className="flex justify-end">
            <ButtonGroup className="mt-5">
                <Button  variant="ghost">Like</Button>
                <Button  variant="ghost">Comment</Button>
            </ButtonGroup>
            </div>
            <div className="mx-5">
                <h2>2 comments</h2>
                <Comment />
                 <Comment />
            </div>
        </div>
        
    )
}

export default Post;