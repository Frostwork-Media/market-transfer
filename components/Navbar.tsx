'use client';

const pages = [
    { name: 'Automate Betting', href: '/' },
    { name: 'Market Mover', href: '/market-mover' },
    { name: 'GPT4Casting', href: '/gpt4casting' },
]
export default function Navbar() {

    return (
    <nav className="flex items-center justify-center space-x-8 bg-gray-100 p-6">
        {
            pages.map((page, i) => {
                const isActive = window.location.pathname === page.href
                
                return (
                    <a key={i} href={page.href} className={`capitalize ${isActive ? 'bg-blue-400 rounded-lg px-2 text-white' : ''}`}>{page.name}</a>
                )
            })
        }
    </nav>
    )
}