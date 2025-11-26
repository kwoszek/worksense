import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button, ButtonGroup } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import DefaultLayout from "@/layouts/default";
import { useState, useEffect, useRef } from "react";
import { useLoginMutation, useRegisterMutation, useRequestPasswordResetMutation, useResetPasswordMutation } from "@/services/usersApi";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import {Checkbox} from "@heroui/checkbox";
import { Link } from "react-router-dom";

export const EyeSlashFilledIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.2714 9.17834C20.9814 8.71834 20.6714 8.28834 20.3514 7.88834C19.9814 7.41834 19.2814 7.37834 18.8614 7.79834L15.8614 10.7983C16.0814 11.4583 16.1214 12.2183 15.9214 13.0083C15.5714 14.4183 14.4314 15.5583 13.0214 15.9083C12.2314 16.1083 11.4714 16.0683 10.8114 15.8483C10.8114 15.8483 9.38141 17.2783 8.35141 18.3083C7.85141 18.8083 8.01141 19.6883 8.68141 19.9483C9.75141 20.3583 10.8614 20.5683 12.0014 20.5683C13.7814 20.5683 15.5114 20.0483 17.0914 19.0783C18.7014 18.0783 20.1514 16.6083 21.3214 14.7383C22.2714 13.2283 22.2214 10.6883 21.2714 9.17834Z"
        fill="currentColor"
      />
      <path
        d="M14.0206 9.98062L9.98062 14.0206C9.47062 13.5006 9.14062 12.7806 9.14062 12.0006C9.14062 10.4306 10.4206 9.14062 12.0006 9.14062C12.7806 9.14062 13.5006 9.47062 14.0206 9.98062Z"
        fill="currentColor"
      />
      <path
        d="M18.25 5.74969L14.86 9.13969C14.13 8.39969 13.12 7.95969 12 7.95969C9.76 7.95969 7.96 9.76969 7.96 11.9997C7.96 13.1197 8.41 14.1297 9.14 14.8597L5.76 18.2497H5.75C4.64 17.3497 3.62 16.1997 2.75 14.8397C1.75 13.2697 1.75 10.7197 2.75 9.14969C3.91 7.32969 5.33 5.89969 6.91 4.91969C8.49 3.95969 10.22 3.42969 12 3.42969C14.23 3.42969 16.39 4.24969 18.25 5.74969Z"
        fill="currentColor"
      />
      <path
        d="M14.8581 11.9981C14.8581 13.5681 13.5781 14.8581 11.9981 14.8581C11.9381 14.8581 11.8881 14.8581 11.8281 14.8381L14.8381 11.8281C14.8581 11.8881 14.8581 11.9381 14.8581 11.9981Z"
        fill="currentColor"
      />
      <path
        d="M21.7689 2.22891C21.4689 1.92891 20.9789 1.92891 20.6789 2.22891L2.22891 20.6889C1.92891 20.9889 1.92891 21.4789 2.22891 21.7789C2.37891 21.9189 2.56891 21.9989 2.76891 21.9989C2.96891 21.9989 3.15891 21.9189 3.30891 21.7689L21.7689 3.30891C22.0789 3.00891 22.0789 2.52891 21.7689 2.22891Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const EyeFilledIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.25 9.14969C18.94 5.51969 15.56 3.42969 12 3.42969C10.22 3.42969 8.49 3.94969 6.91 4.91969C5.33 5.89969 3.91 7.32969 2.75 9.14969C1.75 10.7197 1.75 13.2697 2.75 14.8397C5.06 18.4797 8.44 20.5597 12 20.5597C13.78 20.5597 15.51 20.0397 17.09 19.0697C18.67 18.0897 20.09 16.6597 21.25 14.8397C22.25 13.2797 22.25 10.7197 21.25 9.14969ZM12 16.0397C9.76 16.0397 7.96 14.2297 7.96 11.9997C7.96 9.76969 9.76 7.95969 12 7.95969C14.24 7.95969 16.04 9.76969 16.04 11.9997C16.04 14.2297 14.24 16.0397 12 16.0397Z"
        fill="currentColor"
      />
      <path
        d="M11.9984 9.14062C10.4284 9.14062 9.14844 10.4206 9.14844 12.0006C9.14844 13.5706 10.4284 14.8506 11.9984 14.8506C13.5684 14.8506 14.8584 13.5706 14.8584 12.0006C14.8584 10.4306 13.5684 9.14062 11.9984 9.14062Z"
        fill="currentColor"
      />
    </svg>
  );
};


export default function LoginPage() {
    const [mode, setMode] = useState<'login'|'register'>('login');
    const [loginMutation, { isLoading: loggingIn, error: loginError }] = useLoginMutation();
    const [registerMutation, { isLoading: registering, error: registerError }] = useRegisterMutation();
    const [requestReset, { isLoading: requesting, error: requestError, data: requestData }] = useRequestPasswordResetMutation();
    const [resetPassword, { isLoading: resetting, error: resetError }] = useResetPasswordMutation();
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
    const [captchaToken, setCaptchaToken] = useState('');
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    // Clear success message when navigating away from token view
    useEffect(() => { if (!tokenParam) setResetSuccessMsg(null); }, [tokenParam]);

     const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const checkboxRef = useRef<HTMLInputElement | null>(null);

    // Load reCAPTCHA script & render checkbox for register form
    useEffect(() => {
        if (mode !== 'register') return; // only when register tab active
        if (!recaptchaSiteKey) return;
        // Avoid duplicate script
        if (!document.querySelector('script[data-recaptcha]')) {
            const s = document.createElement('script');
            s.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
            s.async = true;
            s.defer = true;
            s.setAttribute('data-recaptcha', 'true');
            document.head.appendChild(s);
        }
        const interval = setInterval(() => {
            // @ts-ignore
            if (window.grecaptcha && recaptchaContainerRef.current && recaptchaContainerRef.current.childElementCount === 0) {
                // @ts-ignore
                window.grecaptcha.render(recaptchaContainerRef.current, {
                    sitekey: recaptchaSiteKey,
                    callback: (token: string) => setCaptchaToken(token),
                    'expired-callback': () => setCaptchaToken(''),
                    'error-callback': () => setCaptchaToken('')
                });
                clearInterval(interval);
            }
        }, 300);
        return () => clearInterval(interval);
    }, [mode, recaptchaSiteKey]);

    // If already authenticated, redirect to dashboard
    if (authedUser) {

        return <Navigate to="/dashboard" replace />;
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
        if (!username || !email || !password.match(/[A-Z]/g) || password.length<5 || !password.match(/[0-9]/g) || !captchaToken) {
            setPassError(true);
            return};
        try {
            await registerMutation({ username, email, password, captchaToken }).unwrap();
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
                                          type={isVisible ? "text" : "password"}

                                    value={newPw}
                                    onChange={e=>setNewPw(e.target.value)}
                                    endContent={
        <button
          aria-label="toggle password visibility"
          className="focus:outline-solid outline-transparent"
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          ) : (
            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          )}
        </button>
      }
                                />
                                <Input
                                    isRequired
                                    label="Potwierdź hasło"
                                    labelPlacement="outside"
                                    name="confirmNewPassword"
                                    placeholder="Potwierdź hasło"
                                          type={isVisible ? "text" : "password"}

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
                                          type={isVisible ? "text" : "password"}

                                    endContent={
        <button
          aria-label="toggle password visibility"
          className="focus:outline-solid outline-transparent"
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          ) : (
            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          )}
        </button>
      }
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
                                    type={isVisible ? "text" : "password"}
                                    isInvalid={passError}
                                    onChange={()=> setPassError(false)}
                                    errorMessage="Hasło musi mieć co najmniej 5 znaków, zawierać dużą literę i cyfrę"
                                    endContent={
        <button
          aria-label="toggle password visibility"
          className="focus:outline-solid outline-transparent"
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          ) : (
            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          )}
        </button>
      }
      />
      <div className="flex gap-2">
    <Checkbox isRequired ref={checkboxRef}/>
    <p className="hover:cursor-pointer text-sm" onClick={()=>checkboxRef.current?.click()}>
  Rejestrując się, akceptuję{" "}
  <Link
    className="underline"
    to="/terms"
    onClick={(e) => {
      e.stopPropagation();
    }}
  >
    Regulamin
  </Link> 
  {" "}i{ " "} 
  <Link
    className="underline"
    to="/privacy"
    onClick={(e) => {
      e.stopPropagation();
    }}
  >
    Politykę prywatności
  </Link>.

      </p>
      </div>
                                <div className="mt-2 mx-auto" ref={recaptchaContainerRef} />
                                {passError && !captchaToken && <p className="text-xs text-red-600">Captcha wymagana</p>}
                                {registerError && <p className="text-sm text-red-600">{extractErrorMessage(registerError)}</p>}
                                <div className="flex gap-2 w-full justify-center">
                                    <Button className="w-1/2" color="success" type="submit" isDisabled={registering || !captchaToken} isLoading={registering}>Zarejestruj się</Button>
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