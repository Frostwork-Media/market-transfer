import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const Heading = () => {
  return (
    <h1>This Is My App!</h1>
  )
}

export default function Home() {
  return (
    <main>
      <div>
          <Heading />
      </div>
    </main>
  )
}
