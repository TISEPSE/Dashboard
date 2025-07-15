//=========Page dédiée à la crypto=========//

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CryptoDashboardClient() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'eur',
        order: 'market_cap_desc',
        per_page: 15,
        page: 1,
        price_change_percentage: '1h,24h,7d'
      }
    })
      .then(res => {
        console.log(res.data);
        setCryptos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(true);
      });
  }, []);

  if (loading) return (
    <p className='flex items-center justify-center min-h-screen text-[2em]'>
      Chargement...
    </p>
  );

  return (
    <div className='min-h-screen text-[#FeFeFe] px-4 py-6'>
      <h1 className='text-bold text-[1.4em] mb-6'>Top 15 Cryptos</h1>
      
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {cryptos.map(coin => (
          <li className='bg-[#181c20] w-full p-4 rounded-2xl' key={coin.id}>
            <img src={coin.image} alt={coin.name} width={30} height={30} className='mb-2' />
            
            <span className='text-[#d1d1d1] text-lg font-semibold block'>
              {coin.name} ({coin.symbol.toUpperCase()})
            </span>

            <span className='text-[1.5em] block mt-1'>
              {coin.current_price} €
              <span className='ml-4 badge badge-soft badge-success'>
                {coin.price_change_percentage_24h_in_currency?.toFixed(2)} %
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
