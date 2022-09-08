import { useState } from 'react'
import { supabase } from '../utils/supabaseClient';

export default function Auth() {
  const [phone, setPhone] = useState('')

  const handleLogin = async (phone: string) => {
    console.log(phone);
    const resp = await supabase.auth.signInWithOtp({phone})
    console.log(resp)
  }

  return (
    <div className="row flex-center flex">
      <div className="col-6 form-widget">
        <h1 className="header">Supabase + Next.js</h1>
        <p className="description">
          Sign in via magic link with your email below
        </p>
        <div>
          <input
            className="inputField"
            placeholder="Your phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleLogin(phone)
            }}
            className="button block"
          >
            <span>Send code</span>
          </button>
        </div>
      </div>
    </div>
  )
}