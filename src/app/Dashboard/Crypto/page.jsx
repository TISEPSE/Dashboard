'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function CryptoDashboardClient() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRefs = useRef([]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=25&page=1&price_change_percentage=1h,24h,7d')
      .then(res => res.json())
      .then(data => {
        setCryptos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(true);
      });
  }, []);

  useEffect(() => {
    const cleanupFunctions = [];

    carouselRefs.current.forEach((carousel) => {
      if (!carousel) return;

      let isDown = false;
      let startX;
      let scrollLeft;
      let lastX;
      let velocity = 0;
      let animationId;

      // Fonction pour lisser le défilement avec momentum
      const smoothScroll = () => {
        if (Math.abs(velocity) > 0.1) {
          carousel.scrollLeft += velocity;
          velocity *= 0.95; // Friction
          animationId = requestAnimationFrame(smoothScroll);
        }
      };

      const onMouseDown = (e) => {
        isDown = true;
        carousel.classList.add('cursor-grabbing');
        carousel.classList.remove('cursor-grab');
        
        // Désactiver le scroll smooth pendant le drag
        carousel.style.scrollBehavior = 'auto';
        
        startX = e.pageX - carousel.offsetLeft;
        lastX = e.pageX;
        scrollLeft = carousel.scrollLeft;
        velocity = 0;
        
        // Arrêter l'animation de momentum si elle existe
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };

      const onMouseLeave = () => {
        if (isDown) {
          isDown = false;
          carousel.classList.remove('cursor-grabbing');
          carousel.classList.add('cursor-grab');
          carousel.style.scrollBehavior = 'smooth';
          
          // Démarrer l'animation de momentum
          smoothScroll();
        }
      };

      const onMouseUp = () => {
        if (isDown) {
          isDown = false;
          carousel.classList.remove('cursor-grabbing');
          carousel.classList.add('cursor-grab');
          carousel.style.scrollBehavior = 'smooth';
          
          // Démarrer l'animation de momentum
          smoothScroll();
        }
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        
        e.preventDefault();
        
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5; // Sensibilité ajustée
        
        // Calculer la vélocité pour le momentum
        velocity = (lastX - e.pageX) * 0.8;
        lastX = e.pageX;
        
        // Utiliser requestAnimationFrame pour un rendu plus fluide
        requestAnimationFrame(() => {
          carousel.scrollLeft = scrollLeft - walk;
        });
      };

      // Désactiver le scroll molette pendant le survol
      const onWheel = (e) => {
        e.preventDefault();
        
        // Scroll horizontal avec la molette
        const delta = e.deltaY;
        requestAnimationFrame(() => {
          carousel.scrollLeft += delta;
        });
      };

      // Gérer aussi le touch pour mobile
      const onTouchStart = (e) => {
        isDown = true;
        carousel.classList.add('cursor-grabbing');
        carousel.style.scrollBehavior = 'auto';
        
        const touch = e.touches[0];
        startX = touch.pageX - carousel.offsetLeft;
        lastX = touch.pageX;
        scrollLeft = carousel.scrollLeft;
        velocity = 0;
        
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };

      const onTouchEnd = () => {
        if (isDown) {
          isDown = false;
          carousel.classList.remove('cursor-grabbing');
          carousel.style.scrollBehavior = 'smooth';
          smoothScroll();
        }
      };

      const onTouchMove = (e) => {
        if (!isDown) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const x = touch.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
        
        velocity = (lastX - touch.pageX) * 0.8;
        lastX = touch.pageX;
        
        requestAnimationFrame(() => {
          carousel.scrollLeft = scrollLeft - walk;
        });
      };

      // Ajouter tous les event listeners
      carousel.addEventListener('mousedown', onMouseDown);
      carousel.addEventListener('mouseleave', onMouseLeave);
      carousel.addEventListener('mouseup', onMouseUp);
      carousel.addEventListener('mousemove', onMouseMove);
      carousel.addEventListener('wheel', onWheel, { passive: false });
      carousel.addEventListener('touchstart', onTouchStart, { passive: false });
      carousel.addEventListener('touchend', onTouchEnd);
      carousel.addEventListener('touchmove', onTouchMove, { passive: false });

      // Stocker la fonction de nettoyage
      cleanupFunctions.push(() => {
        carousel.removeEventListener('mousedown', onMouseDown);
        carousel.removeEventListener('mouseleave', onMouseLeave);
        carousel.removeEventListener('mouseup', onMouseUp);
        carousel.removeEventListener('mousemove', onMouseMove);
        carousel.removeEventListener('wheel', onWheel);
        carousel.removeEventListener('touchstart', onTouchStart);
        carousel.removeEventListener('touchend', onTouchEnd);
        carousel.removeEventListener('touchmove', onTouchMove);
        
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      });
    });

    // Retourner une fonction qui appelle toutes les fonctions de nettoyage
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [cryptos]);

  if (loading) {
    return (
      <p className="flex items-center justify-center min-h-screen text-[2em]">
        Chargement...
      </p>
    );
  }

  const splitIntoThreeCarousels = (array) => {
    const total = array.length;
    const part = Math.ceil(total / 3);
    return [
      array.slice(0, part),
      array.slice(part, part * 2),
      array.slice(part * 2),
    ];
  };

  const groups = splitIntoThreeCarousels(cryptos);

  const Variation = ({ label, value }) => (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-400">{label}</span>
      <span
        className={`font-semibold px-2 py-0.5 rounded-full ${
          value >= 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
        }`}
      >
        {value?.toFixed(2)}%
      </span>
    </div>
  );

  const renderCard = (coin) => (
    <div
      key={coin.id}
      className="bg-[#2a2d3e] rounded-xl p-4 min-w-[20rem] w-[20rem] flex-shrink-0 flex flex-col justify-between transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-[#323654] hover:z-10 relative"
    >
      <div className="flex justify-between gap-2">
        <div className="w-2/3 break-words">
          <img src={coin.image} alt={coin.name} className="w-7 h-7 mb-2" />
          <span className="text-[#d1d1d1] text-base font-semibold block truncate">
            {coin.name} ({coin.symbol.toUpperCase()})
          </span>
          <span className="text-lg block mt-1">{coin.current_price} €</span>
        </div>
        <div className="w-1/3 flex flex-col items-end gap-1 mt-1">
          <Variation label="1h" value={coin.price_change_percentage_1h_in_currency} />
          <Variation label="24h" value={coin.price_change_percentage_24h_in_currency} />
          <Variation label="7j" value={coin.price_change_percentage_7d_in_currency} />
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-3">
        <button className="btn btn-base btn-outline btn-error w-24 transition-all duration-200 hover:scale-105">
          Ajouter
        </button>
        <button className="btn btn-base btn-outline btn-info w-24 transition-all duration-200 hover:scale-105">
          Info
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-[#FeFeFe] bg-[#212332] px-4 py-6">
      <div className="flex items-center justify-center">
        <h1 className="font-bold text-lg mb-6 bg-[#3A6FF8] p-4 rounded-xl">
          Top {cryptos.length} des cryptos du moment
        </h1>
      </div>

      {groups.map((group, idx) =>
        group.length > 0 ? (
          <div
            key={idx}
            ref={(el) => (carouselRefs.current[idx] = el)}
            className="flex overflow-x-scroll gap-8 scroll-smooth scrollbar-hide mb-8 cursor-grab select-none py-4"
            style={{ 
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch' // Support iOS
            }}
          >
            {group.map(renderCard)}
          </div>
        ) : null
      )}
    </div>
  );
}