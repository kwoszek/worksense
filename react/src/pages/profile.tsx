import DefaultLayout from "@/layouts/default";
import { useState, useRef } from 'react';
import { Button, ButtonGroup } from '@heroui/button';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Avatar } from '@heroui/avatar';
import { getStreakColor } from '@/utils/streak';
import { Input } from '@heroui/input';
import { useMyBadgesQuery, useBadgesQuery, useLogoutMutation, useUpdateProfileMutation, useChangePasswordMutation, useMeQuery, useDeleteMeMutation } from '@/services/usersApi';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useGetPostByUserIdQuery, useDeletePostMutation } from '@/services/forumApi';
import './profile.css';
import { badgeGradientStyle } from '@/utils/badgeColors';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import Cropper from "react-easy-crop";




export default function Profile() {
  const user = useSelector(selectAuthUser);
  const [logout] = useLogoutMutation();
  const { data: badgeList, isLoading: badgesLoading } = useMyBadgesQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();

  const [editing, setEditing] = useState(false);
    const [showAllBadges, setShowAllBadges] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const { data: allBadges, isLoading: allBadgesLoading } = useBadgesQuery();
  const [uname, setUname] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ? `data:image/png;base64,${user.avatar}` : null);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'posts'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteMe, { isLoading: deleting }] = useDeleteMeMutation();
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  // Subscribe to /me so invalidation triggers refetch; we can manually force refetch after save.
  const { refetch: meRefetch } = useMeQuery(undefined);

  // Fetch posts for this user when posts tab is active
  const { data: userPosts, isLoading: postsLoading } = useGetPostByUserIdQuery(
    { userId: user?.id ?? 0, limit: 20, offset: 0 },
    { skip: !user?.id || activeTab !== 'posts' }
  );
  const [deletePost, { isLoading: deletingPost }] = useDeletePostMutation();

  const handleAvatarChange = () => {
    const file = avatarFileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  function onCropComplete(_: any, croppedPixels: any) {
    setCroppedAreaPixels(croppedPixels);
  }

  async function getCroppedImg(imageSrc: string, pixelCrop: any) {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
    });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/png');
  }

  const handleSaveProfile = async () => {
    try {
      const body: any = {};
      if (uname && uname !== user?.username) body.username = uname;
      if (email && email !== user?.email) body.email = email;
      if (avatarPreview && avatarPreview.startsWith('data:image/')) body.avatarBase64 = avatarPreview;
      const result = await updateProfile(body).unwrap();
      // Keep preview as-is (already showing chosen avatar); optionally replace if server returns new.
      if (!avatarPreview && result?.user?.avatar) {
        setAvatarPreview(`data:image/png;base64,${result.user.avatar}`);
      }
      setProfileMsg('Profil zaktualizowany');
      setEditing(false);
      // Force immediate refresh of /me to sync other derived fields (streak etc.)
      meRefetch();
    } catch (e: any) {
  setProfileMsg(e?.data?.error || 'Aktualizacja nie powiodła się');
    }
  };


  const handleChangePassword = async () => {
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg('Hasła nie pasują');
      return;
    }
    try {
      await changePassword({ oldPassword: oldPw, newPassword: newPw }).unwrap();
      setPwMsg('Hasło zmienione');
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (e: any) {
      setPwMsg(e?.data?.error || 'Zmiana nie powiodła się');
    }
  };

  const badgeClass = (key: string) => {
    switch (key) {
      case 'streak':
        return 'badge-gradient-streak';
      case 'posts':
        return 'badge-gradient-contrib';
      case 'comments':
        return 'badge-gradient-comment';
      case 'best_link':
        return 'badge-gradient-bestlink';
      case 'best_comment':
        return 'badge-gradient-bestcomment';
      case 'lookout':
        return 'badge-gradient-lookout';
      case 'outstanding':
        return 'badge-gradient-outstanding';
      case 'account_age':
        return 'badge-gradient-accountage';
      default:
        return ''; // no fixed class; use generated inline style
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <h1 className="text-2xl opacity-70">Profil</h1>
          <div className="flex items-center gap-2">
            
            {!editing && (
              <Button size="sm" variant="flat" onPress={() => setEditing(true)}>Edytuj</Button>
            )}
            {editing && (
              <div>
                  <ButtonGroup>
                  <Button size="sm" variant="flat" color="warning" onPress={() => { setEditing(false); setUname(user?.username||''); setEmail(user?.email||''); setAvatarPreview(user?.avatar ? `data:image/png;base64,${user.avatar}` : null); setProfileMsg(null); }}>Anuluj</Button>
                  <Button size="sm" variant="flat" color="success" isDisabled={updating} onPress={() => { handleSaveProfile(); }}>{updating ? 'Zapisywanie...' : 'Zapisz'}</Button>
                </ButtonGroup>
              </div>
            )}
            {!editing && <><Button size="sm" color="danger" variant="flat" onPress={() => logout().catch(() => {})}>Wyloguj</Button>
            <Button size="sm" color="danger" variant="flat" onPress={() => setShowDeleteConfirm(true)}>Usuń konto</Button></>}
          </div>
        </div>

        <Card className="p-4">
          <CardHeader>
            <div className="flex items-center gap-4 w-full sm:flex-row flex-col">
              <div className="flex items-center gap-4 w-full">
              <div className="flex flex-col items-center">
                <div style={{ borderRadius: 9999, padding: 3, display: 'inline-block', border: `3px solid ${getStreakColor(user?.streak)}` }}>
                  <Avatar
                    src={avatarPreview || undefined}
                    name={user?.username || 'U'}
                    className= {!editing ? "w-20 h-20 text-xl" : "w-20 h-20 text-xl border-medium shadow-xs" }
                    onClick={editing ?() => avatarFileRef.current?.click() : undefined}
                  />
                </div>
                {editing && (
                  <div className="mt-2 text-xs" style={{ display: 'none' }}>
                    <input ref={avatarFileRef} type="file" accept="image/png, image/jpeg" onChange={handleAvatarChange} className="text-xs" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                  <Input className="w-fit bg-transparent mb-1" size="sm" classNames={{input: "text-xl font-semibold", inputWrapper: !editing ? "border-none bg-none" : undefined}} disabled={!editing} variant="bordered" value={!editing ? user?.username ?? 'Nieznany' : uname} readOnly={!editing} onValueChange={editing ? setUname : undefined} />
                  <Input className="w-fit bg-transparent" size="sm" classNames={{input: "text-sm opacity-70", inputWrapper: !editing ? "border-none bg-none" : undefined}} disabled={!editing} variant="bordered" value={!editing ? user?.email ?? '' : email} readOnly={!editing} onValueChange={editing ? setEmail : undefined} />
              </div>
              </div>
              <div className="sm:ml-auto self-start mt-2 text-left sm:text-right sm:mt-0">
                <div className="text-sm opacity-60">Aktualna seria</div>
                <div className="text-2xl font-bold">{user?.streak ?? 0}</div>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="mb-6">
              {profileMsg && <div className="text-sm opacity-70 mb-3">{profileMsg}</div>}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg opacity-70 m-0">Odznaki</h3>
                <div>
                  <Button size="sm" variant="flat" onPress={() => setShowAllBadges(true)}>Pokaż wszystkie odznaki</Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {badgesLoading && <div className="text-sm opacity-60">Ładowanie...</div>}
                {!badgesLoading && (!badgeList || !badgeList.length) && <div className="text-sm opacity-60">Brak odznak</div>}
                {!badgesLoading && badgeList && badgeList.map((b: any) => {
                  const cls = badgeClass(b.key);
                  const style = cls ? undefined : badgeGradientStyle(b.key);
                  return (
                    <span key={b.id || b.key} className={`badge-pill ${cls || ''}`} style={style}>
                      {b.name}{b.level && b.level > 1 ? ` • poziom ${b.level}` : ''}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Tabs: Details / Posts */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
            
                <Button  onPress={() => {activeTab=="posts"?setActiveTab("details"): setActiveTab('posts')}}>Wpisy</Button>
              </div>

              {activeTab === 'posts' && (
                <Card>
                  <CardBody>
                  {postsLoading && <div className="text-sm opacity-60">Ładowanie wpisów...</div>}
                  {!postsLoading && (!userPosts || !userPosts.length) && <div className="text-sm opacity-60">Brak wpisów</div>}
                  {!postsLoading && userPosts && (
                    <div className="flex flex-col gap-3">
                      {userPosts.map((p: any) => {console.log(p.dateposted) ;return(
                        <div key={p.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{p.title}</div>
                              <div className="text-sm opacity-70">{p.username} • {p.dateposted}</div>
                              
                            </div>
                              <div className="text-sm opacity-70">❤ {p.likes} • {p.comments ? p.comments.length : 0} kom.</div>
                          </div>
                            <div className="mt-2 text-sm">{p.content ? (p.content.length > 300 ? p.content.slice(0, 300) + '…' : p.content) : ''}</div>
                            {p.userid === user?.id && (
                              <div className="mt-3 flex justify-end">
                                <Button size="sm" color="danger" variant="flat" onPress={async () => {
                                  const ok = window.confirm('Na pewno usunąć ten wpis?');
                                  if (!ok) return;
                                  try {
                                    await deletePost({ postId: p.id }).unwrap();
                                  } catch (e: any) {
                                    setProfileMsg(e?.data?.error || 'Usuwanie wpisu nie powiodło się');
                                  }
                                }} isDisabled={deletingPost}>{deletingPost ? 'Usuwanie...' : 'Usuń wpis'}</Button>
                              </div>
                            )}
                        </div>
                      )})}
                    </div>
                  )}</CardBody>
                </Card>
              )}
            </div>

            <Modal className="h-[75svh] overflow-y-scroll" isOpen={showAllBadges} placement="center" onOpenChange={setShowAllBadges}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader>Wszystkie odznaki</ModalHeader>
                    <ModalBody className="h-[65svh] overflow-y-scroll">
                      {allBadgesLoading && <div className="text-sm opacity-60">Ładowanie odznak...</div>}
                      {!allBadgesLoading && (!allBadges || !allBadges.length) && <div className="text-sm opacity-60">Brak zdefiniowanych odznak</div>}
                      {!allBadgesLoading && allBadges && (
                        <div className="flex flex-col gap-3">
                          {allBadges.map((def: any) => {
                            const owned = badgeList?.some((b: any) => b.key === def.key);
                            const userLevel = badgeList?.find((b: any) => b.key === def.key)?.level || 0;
                            return (
                              <div key={def.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center">
                                  <div className={`badge-pill ${badgeClass(def.key)} mr-3`} style={{ width: 44, height: 28 }} />
                                  <div>
                                    <div className="font-medium">{def.name} {def.maxLevel > 1 ? <span className="text-xs opacity-60">(maks. poziom {def.maxLevel})</span> : null}</div>
                                    <div className="text-sm opacity-70">{def.description}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {owned ? <div className="text-sm text-green-700">Zdobyte {userLevel > 1 ? `• poziom ${userLevel}` : ''}</div> : <div className="text-sm opacity-60">Nie zdobyte</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ModalBody>
                    <ModalFooter>
                        <div className="w-full flex justify-end">
                        <Button size="sm" variant="flat" onPress={onClose}>Zamknij</Button>
                      </div>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
              </Modal>

              <Modal isOpen={showDeleteConfirm} placement="center" onOpenChange={setShowDeleteConfirm}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader>Usuń konto</ModalHeader>
                      <ModalBody>
                        <div className="text-sm opacity-80 mb-3">To działanie jest nieodwracalne. Aby potwierdzić wpisz <strong>DELETE</strong> i kliknij Usuń.</div>
                        <Input label="Potwierdź (wpisz DELETE)" size="sm" value={deleteConfirmText} onValueChange={setDeleteConfirmText} />
                      </ModalBody>
                      <ModalFooter>
                        <div className="w-full flex justify-end gap-2">
                          <Button size="sm" variant="flat" onPress={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); onClose && onClose(); }}>Anuluj</Button>
                          <Button size="sm" color="danger" onPress={async () => {
                            if (deleteConfirmText !== 'DELETE') return;
                            try {
                              await deleteMe().unwrap();
                            } catch (e: any) {
                              setProfileMsg(e?.data?.error || 'Usuwanie konta nie powiodło się');
                              return;
                            }
                            // Navigate away after account deletion (auth state cleared by onQueryStarted)
                            window.location.href = '/';
                          }} isDisabled={deleting || deleteConfirmText !== 'DELETE'}>{deleting ? 'Usuwanie...' : 'Usuń'}</Button>
                        </div>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>

            <Modal isOpen={showCropper} placement="center" onOpenChange={setShowCropper}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader>Dostosuj awatar</ModalHeader>
                    <ModalBody>
                      {selectedImage ? (
                        <div style={{ width: '100%', height: 360, position: 'relative' }}>
                          <Cropper
                            image={selectedImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                          />
                        </div>
                      ) : (
                        <div>Brak wybranego obrazu</div>
                      )}
                    </ModalBody>
                    <ModalFooter>
                      <div className="w-full flex justify-end gap-2">
                        <Button size="sm" variant="flat" onPress={() => { setShowCropper(false); setSelectedImage(null);setCrop({ x: 0, y: 0 });
                            setZoom(1); onClose && onClose(); }}>Anuluj</Button>
                        <Button size="sm" color="success" onPress={async () => {
                          if (!selectedImage || !croppedAreaPixels) return;
                          try {
                            const croppedDataUrl = await getCroppedImg(selectedImage, croppedAreaPixels);
                            setAvatarPreview(croppedDataUrl);
                            setShowCropper(false);
                            setSelectedImage(null);
                            setCrop({ x: 0, y: 0 });
                            setZoom(1);
                
                            // clear file input
                            if (avatarFileRef.current) avatarFileRef.current.value = '';
                            onClose && onClose();
                          } catch (e) {
                            // ignore
                          }
                        }}>{'Zapisz'}</Button>
                      </div>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>

            <div className="mb-6">
              <h3 className="text-lg opacity-70 mb-2">Zmień hasło</h3>
              <div className="flex flex-col gap-3 max-w-sm">
                <Input label="Stare hasło" size="sm" type="password" value={oldPw} onValueChange={setOldPw} />
                <Input label="Nowe hasło" size="sm" type="password" value={newPw} onValueChange={setNewPw} />
                <Input label="Potwierdź nowe hasło" size="sm" type="password" value={confirmPw} onValueChange={setConfirmPw} />
                {pwMsg && <div className="text-xs opacity-70">{pwMsg}</div>}
                <Button size="sm" color="success" variant="flat" isDisabled={changingPw} onPress={handleChangePassword}>{changingPw ? 'Zmieniamy...' : 'Zmień hasło'}</Button>
              </div>
            </div>

            
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}

