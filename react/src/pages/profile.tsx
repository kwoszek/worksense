import DefaultLayout from "@/layouts/default";
import { Button } from '@heroui/button';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/services/usersApi';
 


export default function Profile(){
    
      const user = useSelector(selectAuthUser);
      const [logout] = useLogoutMutation();
    return(
       <DefaultLayout>

        <div>
             <span className="text-sm opacity-80">{user.username}</span>
            <Button size="sm" variant="flat" onPress={() => logout().catch(()=>{})}>Logout</Button> 
        </div>

       </DefaultLayout>
    )
}

