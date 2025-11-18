import DefaultLayout from "@/layouts/default";
import { Button } from '@heroui/button';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/services/usersApi';
 import { useNavigate } from "react-router-dom";
 import {Route, Routes, useLocation} from "react-router-dom";


export default function Profile(){
     const nav = useNavigate();
      const { pathname } = useLocation();
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

