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
        per_page: 10,
        page: 1,
        price_change_percentage: '1h,24h,7d',
      },
    })
      .then(res => {
        setCryptos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(true);
      });
  }, []);

  if (loading) return (
    <p className="flex items-center justify-center min-h-screen text-[2em]">
      Chargement...
    </p>
  );

  return (
    <div className="min-h-screen text-[#FeFeFe] px-4 py-6">
      <h1 className="text-bold text-[1.4em] mb-6">Top des crypto actuels</h1>
      <div
        className="flex overflow-x-auto space-x-4 snap-x snap-mandatory flex-no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >

        {cryptos.map((coin) => (
          <div
            key={coin.id}
            className="bg-[#181c20] rounded-2xl p-4 min-w-[250px] snap-start flex-shrink-0"
          >
            <div className="flex justify-between items-start gap-2">
              {/* Partie gauche */}
              <div className="max-w-[60%] break-words">
                <img src={coin.image} alt={coin.name} width={30} height={30} className="mb-2" />
                <span className="text-[#d1d1d1] text-lg font-semibold block truncate">
                  {coin.name} ({coin.symbol.toUpperCase()})
                </span>
                <span className="text-[1.5em] block mt-1">
                  {coin.current_price} €
                </span>
              </div>

              {/* Partie droite */}
              <div className="text-right">
                <p className="text-sm text-gray-400">Variation 24h</p>
                <p className={`text-[1em] font-bold ${coin.price_change_percentage_24h_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coin.price_change_percentage_24h_in_currency?.toFixed(2)} %
                </p>

                <p className="text-sm text-gray-400 mt-2">Variation 1h</p>
                <p className={`text-[1em] font-bold ${coin.price_change_percentage_1h_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coin.price_change_percentage_1h_in_currency?.toFixed(2)} %
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

