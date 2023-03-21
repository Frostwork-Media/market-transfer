'use client';
import Image from 'next/image'
import { Inter } from 'next/font/google'
import Button from '../components/Button'
import { useState } from 'react'

export default function Home() {
  const [ manifoldData, setManifoldData ] = useState(null) 

  const handleComplete = (data) => {
    setManifoldData(data)
  }

  return (
    <main>
      <div>
       <Button handleComplete={handleComplete} />
       <p>{ 
          manifoldData ? manifoldData : 'no data'
        }</p>
      </div>
    </main>
  )
}
