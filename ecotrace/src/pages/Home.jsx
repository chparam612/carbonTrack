import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    emoji: '🧮',
    title: 'Scientific Calculator',
    desc: 'Powered by IPCC AR6, US EPA & India CEA 2023 emission factors for pinpoint accuracy.',
  },
  {
    emoji: '🤖',
    title: 'Gemini AI Coach',
    desc: 'Get personalised insights, tips, and a weekly challenge tailored to your lifestyle.',
  },
  {
    emoji: '🗺️',
    title: 'Eco Map',
    desc: 'Find EV chargers, parks, organic stores and recycling centres near you.',
  },
];

// Leaf particle system
function LeafCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 30 }, () => createLeaf(canvas));

    function createLeaf(canvas) {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 8 + Math.random() * 14,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: 0.3 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.15 + Math.random() * 0.3,
        color: ['#2d5016', '#3d6b1f', '#DAA520', '#8B4513'][Math.floor(Math.random() * 4)],
      };
    }

    function drawLeaf(ctx, p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size / 2);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size / 2, p.size / 2, 0, p.size / 2);
      ctx.bezierCurveTo(-p.size / 2, p.size / 2, -p.size / 2, -p.size / 2, 0, -p.size / 2);
      ctx.fill();
      // Stem
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -p.size / 2);
      ctx.lineTo(0, p.size / 2);
      ctx.stroke();
      ctx.restore();
    }

    let animId;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(Date.now() / 2000 + p.y) * 0.3;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        drawLeaf(ctx, p);
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="leaf-canvas" />;
}

// Live CO₂ counter
function CO2Counter() {
  const [ppm, setPpm] = useState(422.0);

  useEffect(() => {
    // CO₂ rises ~2.4 ppm/year ≈ 7.6e-8 ppm/second
    const interval = setInterval(() => {
      setPpm((prev) => parseFloat((prev + 0.0000001).toFixed(7)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="inline-flex items-center gap-3 glass-card px-5 py-3 mx-auto"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      <span className="text-sm font-medium text-forest-800 dark:text-cream-100">
        Live atmospheric CO₂:
      </span>
      <span className="font-display font-bold text-xl text-red-600 dark:text-red-400">
        {ppm.toFixed(1)} ppm
      </span>
    </motion.div>
  );
}

export default function Home({ setCurrentPage }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <LeafCanvas />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-6xl mb-4 block animate-float">🌿</span>
          <h1 className="font-display text-5xl md:text-7xl font-black text-forest-900 dark:text-cream-100 leading-tight mb-4">
            Know Your Carbon.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-700 to-gold-500">
              Change Your Future.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-forest-700/80 dark:text-cream-200/70 max-w-xl mx-auto mb-8 font-body">
            Track your carbon footprint with scientific precision. Get AI-powered insights.
            Build habits that heal the planet.
          </p>
        </motion.div>

        <CO2Counter />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => setCurrentPage('quiz')}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
          >
            🌱 Start My Journey
          </button>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="btn-ghost text-lg px-8 py-4"
          >
            View Dashboard
          </button>
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-bold text-center text-forest-900 dark:text-cream-100 mb-10"
        >
          Everything you need to go green
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="glass-card p-6 text-center group cursor-default"
            >
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-200">
                {f.emoji}
              </span>
              <h3 className="font-display font-bold text-xl text-forest-800 dark:text-cream-100 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-forest-700/70 dark:text-cream-200/60 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 bg-forest-900 dark:bg-forest-800 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'India avg footprint', value: '1,900 kg', sub: 'CO₂/year' },
            { label: 'Global average',       value: '4,700 kg', sub: 'CO₂/year' },
            { label: 'Paris 1.5°C target',   value: '2,300 kg', sub: 'CO₂/year' },
            { label: 'Trees to offset 1 ton',value: '47 trees', sub: 'per year' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="font-display text-2xl font-bold text-gold-400">{s.value}</div>
              <div className="text-xs text-cream-200/70 mt-1">{s.label}</div>
              <div className="text-xs text-cream-200/50">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
