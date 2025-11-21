import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button, ButtonGroup } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import DefaultLayout from "@/layouts/default";
import { useState, useEffect } from "react";
import { useLoginMutation, useRegisterMutation, useRequestPasswordResetMutation, useResetPasswordMutation } from "@/services/usersApi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';

export default function LoginPage() {
    const [mode, setMode] = useState<'login'|'register'>('login');
    const [loginMutation, { isLoading: loggingIn, error: loginError }] = useLoginMutation();
    const [registerMutation, { isLoading: registering, error: registerError }] = useRegisterMutation();
    const [requestReset, { isLoading: requesting, error: requestError, data: requestData }] = useRequestPasswordResetMutation();
    const [resetPassword, { isLoading: resetting, error: resetError, data: resetData }] = useResetPasswordMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const authedUser = useSelector(selectAuthUser);
    const [passError, setPassError] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmNewPw, setConfirmNewPw] = useState('');
    const [setPwErrors, setSetPwErrors] = useState<string[]>([]);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    // Clear success message when navigating away from token view
    useEffect(() => { if (!tokenParam) setResetSuccessMsg(null); }, [tokenParam]);

    // If already authenticated, redirect to dashboard
    if (authedUser) {
        
        return <DefaultLayout>{}<div className="min-h-full flex items-center justify-center"><p>Jesteś już zalogowany</p></div></DefaultLayout>;
    }

   
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    function extractErrorMessage(err: any): string {
        if (!err) return '';
        // RTK Query fetch error shape
        if (typeof err === 'object' && 'status' in err) {
            const data: any = (err as any).data;
            if (!data) return 'Wystąpił nieoczekiwany błąd';
            if (typeof data.error === 'string') return data.error;
            if (Array.isArray(data.errors)) {
                return data.errors.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
            }
            if (typeof data === 'string') return data;
            return JSON.stringify(data);
        }
        if (typeof err === 'object' && err !== null && 'message' in err) return (err as any).message;
        return 'Wystąpił nieoczekiwany błąd';
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const identifier = (data.get('identifier') || '').toString().trim();
        const password = (data.get('password') || '').toString();
        if (!identifier || !password) return;
        try {
            await loginMutation({ identifier, password }).unwrap();
            navigate(from, { replace: true });
        } catch {}
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const username = (data.get('username') || '').toString().trim();
        const email = (data.get('email') || '').toString().trim();
        const password: string = (data.get('password') || '').toString();
        if (!username || !email || !password.match(/[A-Z]/g) || password.length<5 || !password.match(/[0-9]/g)) {
            setPassError(true);
            return};
        try {
            await registerMutation({ username, email, password }).unwrap();
            navigate('/dashboard', { replace: true });
        } catch {}
    }

    async function handleRequestReset(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!resetEmail.trim()) return;
        try { await requestReset({ email: resetEmail.trim() }).unwrap(); } catch {}
    }

    function validateNewPassword(pw: string): string[] {
        const errs: string[] = [];
        if (pw.length < 5) errs.push('Min 5 znaków');
        if (!/[A-Z]/.test(pw)) errs.push('Brak dużej litery');
        if (!/\d/.test(pw)) errs.push('Brak cyfry');
        return errs;
    }

    async function handleSetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!tokenParam) return;
        const errs = validateNewPassword(newPw);
        if (newPw !== confirmNewPw) errs.push('Hasła nie są takie same');
        setSetPwErrors(errs);
        if (errs.length) return;
        try {
            await resetPassword({ token: tokenParam, password: newPw }).unwrap();
            // Navigate back to clean login URL & show success
            setResetSuccessMsg('Hasło zaktualizowane. Możesz się zalogować.');
            navigate('/login', { replace: true });
            setMode('login');
        } catch {}
    }

    // Dedicated token view: show ONLY password set form
    if (tokenParam) {
        return (
            <DefaultLayout>
                <div className="min-h-full flex items-center justify-center p-6">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <h2 className="text-xl opacity-80">Ustaw nowe hasło</h2>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <Form className="flex flex-col gap-4" onSubmit={handleSetPassword}>
                                <Input
                                    isRequired
                                    label="Nowe hasło"
                                    labelPlacement="outside"
                                    name="newPassword"
                                    placeholder="Nowe hasło"
                                    type="password"
                                    value={newPw}
                                    onChange={e=>setNewPw(e.target.value)}
                                />
                                <Input
                                    isRequired
                                    label="Potwierdź hasło"
                                    labelPlacement="outside"
                                    name="confirmNewPassword"
                                    placeholder="Potwierdź hasło"
                                    type="password"
                                    value={confirmNewPw}
                                    onChange={e=>setConfirmNewPw(e.target.value)}
                                />
                                {setPwErrors.length>0 && <ul className="text-xs text-red-600 list-disc pl-4">{setPwErrors.map(e=> <li key={e}>{e}</li>)}</ul>}
                                {resetError && <p className="text-sm text-red-600">{extractErrorMessage(resetError)}</p>}
                                <div className="flex gap-2 w-full justify-center">
                                    <Button className="w-1/2" color="success" type="submit" isDisabled={resetting} isLoading={resetting}>Zapisz</Button>
                                    <Button type="button" className="w-1/2" variant="flat" onPress={()=>{navigate('/login',{replace:true}); setMode('login');}}>Anuluj</Button>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="min-h-full flex items-center justify-center gap-5 p-6">
                <Card className="w-100 max-w-md">
                    <CardHeader className="flex justify-between w-full">
                        <ButtonGroup className="w-full flex flex-wrap gap-1">
                            <Button disabled={mode==='login'} onPress={() => setMode('login')} color={mode=="login"?"success":"default"} className="flex-1 opacity-80">Login</Button>
                            <Button disabled={mode==='register'} onPress={() => setMode('register')} className="flex-1 opacity-80" color={mode=="register"?"success":"default"} >Rejestracja</Button>
                        </ButtonGroup>
                    </CardHeader>
                    <Divider />
                    {mode === 'login' && (
                        <CardBody className="p-6">
                            <Form className="flex flex-col gap-4" onSubmit={handleLogin}>
                                <Input
                                    isRequired
                                    label="Email lub nazwa użytkownika"
                                    labelPlacement="outside"
                                    name="identifier"
                                    placeholder="Wprowadź email lub nazwę użytkownika"
                                    type="text"
                                />
                                <Input
                                    isRequired
                                    label="Hasło"
                                    labelPlacement="outside"
                                    name="password"
                                    placeholder="Wprowadź hasło"
                                    type="password"
                                />
                                {loginError && <p className="text-sm text-red-600">{extractErrorMessage(loginError)}</p>}
                                {resetSuccessMsg && <p className="text-sm text-green-600">{resetSuccessMsg}</p>}
                                <div className="flex gap-2 justify-center w-full">
                                    <Button  color="success" type="submit" className="w-1/2" isDisabled={loggingIn} isLoading={loggingIn}>Login</Button>
                                    <Button type="reset" variant="flat" className="w-1/2" isDisabled={loggingIn}>Reset</Button>
                                </div>
                                <div className="text-center mt-2 text-xs">
                                    <button type="button" className="underline opacity-70 hover:cursor-pointer" onClick={() => setShowResetModal(true)}>Zapomniałeś hasła?</button>
                                </div>
                            </Form>
                        </CardBody>
                    )}
                    {mode === 'register' && (
                        <CardBody className="p-6">
                            <Form className="flex flex-col gap-4" onSubmit={handleRegister}>
                                <Input
                                    isRequired
                                    label="Nazwa użytkownika"
                                    labelPlacement="outside"
                                    name="username"
                                    placeholder="Wybierz nazwę użytkownika"
                                    type="text"
                                />
                                <Input
                                    isRequired
                                    label="Email"
                                    labelPlacement="outside"
                                    name="email"
                                    placeholder="Wprowadź email"
                                    type="email"
                                />
                                <Input
                                    isRequired
                                    label="Hasło"
                                    labelPlacement="outside"
                                    name="password"
                                    placeholder="Stwórz hasło"
                                    type="password"
                                    isInvalid={passError}
                                    onChange={()=> setPassError(false)}
                                    errorMessage="Hasło musi mieć co najmniej 5 znaków, zawierać dużą literę i cyfrę"
                                />
                                {registerError && <p className="text-sm text-red-600">{extractErrorMessage(registerError)}</p>}
                                <div className="flex gap-2 w-full justify-center">
                                    <Button className="w-1/2" color="success" type="submit" isDisabled={registering} isLoading={registering}>Zarejestruj się</Button>
                                    <Button type="reset" className="w-1/2" variant="flat" isDisabled={registering} onPress={()=>setPassError(false)}>Reset</Button>
                                </div>
                            </Form>
                        </CardBody>
                    )}
                </Card>
            </div>
            <Modal isOpen={showResetModal} onOpenChange={setShowResetModal} placement="top-center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="text-lg">Reset hasła</ModalHeader>
                            <Divider />
                            <ModalBody>
                                <Form className="flex flex-col gap-4" onSubmit={(e)=>{handleRequestReset(e);}}>
                                    <p className="text-sm opacity-70">Podaj email. Jeśli istnieje w bazie, wyślemy link resetu.</p>
                                    <Input
                                        isRequired
                                        label="Email"
                                        labelPlacement="outside"
                                        name="resetEmail"
                                        placeholder="Wprowadź email"
                                        type="email"
                                        value={resetEmail}
                                        onChange={e=>setResetEmail(e.target.value)}
                                    />
                                    {requestError && <p className="text-xs text-red-600">{extractErrorMessage(requestError)}</p>}
                                    {requestData && requestData.ok && !requestError && <p className="text-xs text-green-600">Jeśli email istnieje, wysłano link.</p>}
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="flat" onPress={onClose}>Zamknij</Button>
                                        <Button color="success" type="submit" isDisabled={requesting} isLoading={requesting}>Wyślij link</Button>
                                    </div>
                                </Form>
                            </ModalBody>
                            <ModalFooter />
                        </>
                    )}
                </ModalContent>
            </Modal>
        </DefaultLayout>
    );
}
