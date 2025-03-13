export default function CalayoHeader({isHome}: {isHome:boolean}) {
    return (
        <div>
        <header className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!isHome ? <h1 className="text-3xl font-bold tracking-tight text-white">Calayo Clothing</h1> : 
          <h1 className="text-3xl font-bold tracking-tight text-white"></h1>}
        </div>
      </header>
      </div>
    )
}