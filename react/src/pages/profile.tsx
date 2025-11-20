import DefaultLayout from "@/layouts/default";
import { useState, useRef } from 'react';
import { Button, ButtonGroup } from '@heroui/button';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Avatar } from '@heroui/avatar';
import { Input } from '@heroui/input';
import { useMyBadgesQuery, useLogoutMutation, useUpdateProfileMutation, useChangePasswordMutation } from '@/services/usersApi';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';

export default function Profile() {
  const user = useSelector(selectAuthUser);
  const [logout] = useLogoutMutation();
  const { data: badgeList, isLoading: badgesLoading } = useMyBadgesQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();

  const [editing, setEditing] = useState(false);
  const [uname, setUname] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ? `data:image/png;base64,${user.avatar}` : null);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const handleAvatarChange = () => {
    const file = avatarFileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      const body: any = {};
      if (uname && uname !== user?.username) body.username = uname;
      if (email && email !== user?.email) body.email = email;
      if (avatarPreview && avatarPreview.startsWith('data:image/')) body.avatarBase64 = avatarPreview;
      await updateProfile(body).unwrap();
      setProfileMsg('Profile updated');
      setEditing(false);
      setUname(user?.username||''); 
      setEmail(user?.email||''); 
      setAvatarPreview(user?.avatar ? `data:image/png;base64,${user.avatar}` : null);
    } catch (e: any) {
      setProfileMsg(e?.data?.error || 'Update failed');
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg('Passwords do not match');
      return;
    }
    try {
      await changePassword({ oldPassword: oldPw, newPassword: newPw }).unwrap();
      setPwMsg('Password changed');
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (e: any) {
      setPwMsg(e?.data?.error || 'Change failed');
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <h1 className="text-2xl opacity-70">Profile</h1>
          <div className="flex items-center gap-2">
            {!editing && (
              <Button size="sm" variant="flat" onPress={() => setEditing(true)}>Edit</Button>
            )}
            {editing && (
              <div>
                <ButtonGroup>
                  <Button size="sm" variant="flat" color="warning" onPress={() => { setEditing(false); setUname(user?.username||''); setEmail(user?.email||''); setAvatarPreview(user?.avatar ? `data:image/png;base64,${user.avatar}` : null); setProfileMsg(null); }}>Cancel</Button>
                  <Button size="sm" variant="flat" color="success" onPress={() => { handleSaveProfile(); }}>Save</Button>
                </ButtonGroup>
              </div>
            )}
            <Button size="sm" color="danger" variant="flat" onPress={() => logout().catch(() => {})}>Logout</Button>
          </div>
        </div>

        <Card className="p-4">
          <CardHeader>
            <div className="flex items-center gap-4 w-full">
              <div className="flex flex-col items-center">
                <Avatar
                  src={avatarPreview || undefined}
                  name={user?.username || 'U'}
                  className= {!editing ? "w-20 h-20 text-xl" : "w-20 h-20 text-xl border-medium shadow-xs" }
                  onClick={editing ?() => avatarFileRef.current?.click() : undefined}
                />
                {editing && (
                  <div className="mt-2 text-xs" style={{ display: 'none' }}>
                    <input ref={avatarFileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="text-xs" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                  <Input className="w-70 bg-transparent mb-1" size="sm" classNames={{input: "text-xl font-semibold", inputWrapper: !editing ? "border-none bg-none" : undefined}} disabled={!editing} variant="bordered" value={!editing ? user?.username ?? 'Unknown' : uname} readOnly={!editing} onValueChange={editing ? setUname : undefined} />
                  <Input className="w-70 bg-transparent" size="sm" classNames={{input: "text-sm opacity-70", inputWrapper: !editing ? "border-none bg-none" : undefined}} disabled={!editing} variant="bordered" value={!editing ? user?.email ?? '' : email} readOnly={!editing} onValueChange={editing ? setEmail : undefined} />
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm opacity-60">Current streak</div>
                <div className="text-2xl font-bold">{user?.streak ?? 0}</div>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="mb-6">
              <h3 className="text-lg opacity-70 mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badgesLoading && <div className="text-sm opacity-60">Loading...</div>}
                {!badgesLoading && (!badgeList || !badgeList.length) && <div className="text-sm opacity-60">No badges yet</div>}
                {!badgesLoading && badgeList && badgeList.map((b: any) => (
                  <span key={b.id || b.key} className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
                    {b.name}{b.level && b.level > 1 ? ` • lvl ${b.level}` : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg opacity-70 mb-2">Change Password</h3>
              <div className="flex flex-col gap-3 max-w-sm">
                <Input label="Old Password" size="sm" type="password" value={oldPw} onValueChange={setOldPw} />
                <Input label="New Password" size="sm" type="password" value={newPw} onValueChange={setNewPw} />
                <Input label="Confirm New Password" size="sm" type="password" value={confirmPw} onValueChange={setConfirmPw} />
                {pwMsg && <div className="text-xs opacity-70">{pwMsg}</div>}
                <Button size="sm" color="success" variant="flat" isDisabled={changingPw} onPress={handleChangePassword}>{changingPw ? 'Changing...' : 'Change Password'}</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg opacity-70 mb-2">About</h3>
              <p className="text-sm opacity-80">Manage your profile, badges and security settings here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}

