'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarChart from "@/app/components/Crypto/graphique";

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

  if (loading) {
    return (
      <p className="flex items-center justify-center min-h-screen text-[2em]">
        Chargement...
      </p>
    );
  }

  const mid = Math.ceil(cryptos.length / 2);
  const topRow = cryptos.slice(0, mid);
  const bottomRow = cryptos.slice(mid);

  return (
    <div className="min-h-screen text-[#FeFeFe] bg-[#212332] px-4 py-6">
      <div className='flex items-center justify-center'>
        <h1 className="font-bold text-[1.3em] mb-6 bg-[#3A6FF8] p-4 rounded-xl">
          Top {cryptos.length} cryptos actuelles</h1>
      </div>

      {/* Premier carrousel */}
      <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scroll-smooth flex-no-scrollbar mb-10">
        {topRow.map(coin => (
          <div
            key={coin.id}
            className="bg-[#2a2d3e] rounded-2xl p-4 min-w-[250px] snap-start flex-shrink-0"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="max-w-[60%] break-words">
                <img src={coin.image} alt={coin.name} width={30} height={30} className="mb-2" />
                <span className="text-[#d1d1d1] text-lg font-semibold block truncate">
                  {coin.name} ({coin.symbol.toUpperCase()})
                </span>
                <span className="text-[1.5em] block mt-1">
                  {coin.current_price} €
                </span>
              </div>
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

      {/* Deuxième carrousel */}
      <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scroll-smooth flex-no-scrollbar mb-20">
        {bottomRow.map(coin => (
          <div
            key={coin.id}
            className="bg-[#2a2d3e] rounded-2xl p-4 min-w-[250px] snap-start flex-shrink-0"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="max-w-[60%] break-words">
                <img src={coin.image} alt={coin.name} width={30} height={30} className="mb-2" />
                <span className="text-[#d1d1d1] text-lg font-semibold block truncate">
                  {coin.name} ({coin.symbol.toUpperCase()})
                </span>
                <span className="text-[1.5em] block mt-1">
                  {coin.current_price} €
                </span>
              </div>
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

      <BarChart />
    </div>
  );
}
