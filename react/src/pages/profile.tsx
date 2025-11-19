import DefaultLayout from "@/layouts/default";
import { Button } from '@heroui/button';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { useMyBadgesQuery } from '@/services/usersApi';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/services/usersApi';

export default function Profile(){
    const user = useSelector(selectAuthUser);

    console.log(user);
    const [logout] = useLogoutMutation();

    const avatarSrc = user?.avatar ? `data:image/png;base64,${user.avatar}` : null;

  const { data: badgeList, isLoading: badgesLoading } = useMyBadgesQuery();

    return(
       <DefaultLayout>
         <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between py-6">
             <h1 className="text-2xl opacity-70">Profile</h1>
             <div className="flex items-center gap-2">
               {/* <Button size="sm" variant="flat" onPress={() => }>Edit</Button> */}
               <Button size="sm" color="danger" variant="flat" onPress={() => logout().catch(()=>{})}>Logout</Button>
             </div>
           </div>

           <Card className="p-4">
             <CardHeader>
               <div className="flex items-center gap-4">
                 <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                   {avatarSrc ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-xl font-semibold text-gray-700">{user?.username?.slice(0,1)?.toUpperCase() ?? 'U'}</div>
                   )}
                 </div>
                 <div>
                   <div className="text-xl font-semibold">{user?.username ?? 'Unknown'}</div>
                   <div className="text-sm opacity-70">{user?.email ?? ''}</div>
                 </div>
                 <div className="ml-auto text-right">
                   <div className="text-sm opacity-60">Current streak</div>
                   <div className="text-2xl font-bold">{user?.streak ?? 0}</div>
                 </div>
               </div>
             </CardHeader>
             <Divider />
             <CardBody>
               <div className="mb-4">
                 <h3 className="text-lg opacity-70 mb-2">Badges</h3>
                 <div className="flex flex-wrap gap-2">
                   {badgesLoading && <div className="text-sm opacity-60">Loading...</div>}
                   {!badgesLoading && (!badgeList || !badgeList.length) && <div className="text-sm opacity-60">No badges yet</div>}
                   {!badgesLoading && badgeList && badgeList.map((b: any) => (
                     <span key={b.id} className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
                       {b.name}{b.level && b.level > 1 ? ` • lvl ${b.level}` : ''}
                     </span>
                   ))}
                 </div>
               </div>

               <div>
                 <h3 className="text-lg opacity-70 mb-2">About</h3>
                 <p className="text-sm opacity-80">This is your profile. You can view your stats, badges and account details here.</p>
               </div>
             </CardBody>
           </Card>
         </div>
       </DefaultLayout>
    )
}

