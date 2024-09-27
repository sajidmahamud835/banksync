import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const PlaidLink = ({ user, className }: { user: User, className?: string }) => {
  const router = useRouter();

  const [token, setToken] = useState('');

  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user);

      setToken(data?.linkToken);
    }

    getLinkToken();
  }, [user]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    await exchangePublicToken({
      publicToken: public_token,
      user,
    })

    router.push('/');
  }, [user])

  const config: PlaidLinkOptions = {
    token,
    onSuccess
  }

  const { open, ready } = usePlaidLink(config);

  return (
    <button
      onClick={() => open()}
      className={cn(
        "sidebar-link group transition-all duration-300 ease-in-out",
        "hover:bg-bank-gradient",
        className
      )}
    >
      <div className="relative size-6 transition-transform group-hover:scale-110">
        <Image
          src="/icons/plus.svg"
          alt="Connect Bank"
          fill
          className="group-hover:brightness-[3] group-hover:invert-0"
        />
      </div>
      <p className="sidebar-label group-hover:text-white">
        Connect Bank
      </p>
    </button>
  )
}

export default PlaidLink