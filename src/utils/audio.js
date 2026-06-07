let audioCtx = null;

/**
 * Synthesizes a realistic keyboard typing sound using the Web Audio API.
 * This runs completely offline, uses zero assets, and has extremely low latency.
 * Supports multiple sound profiles.
 * @param {string} key - The key that was pressed.
 * @param {string} profile - The sound profile ("mechanical", "typewriter", "bubble", "digital").
 */
export const playClickSound = (key = "", profile = "mechanical") => {
  try {
    // Lazy initialize the AudioContext upon first user interaction
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume audio context if suspended (modern browsers require this)
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // --- 1. TYPEWRITER PROFILE ---
    if (profile === "typewriter") {
      if (key === "Enter") {
        // Carriage slide (sweep down)
        const slideOsc = audioCtx.createOscillator();
        const slideGain = audioCtx.createGain();
        slideOsc.type = "triangle";
        slideOsc.frequency.setValueAtTime(450, now);
        slideOsc.frequency.linearRampToValueAtTime(120, now + 0.12);
        slideGain.gain.setValueAtTime(0.08, now);
        slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        slideOsc.connect(slideGain);
        slideGain.connect(audioCtx.destination);
        slideOsc.start(now);
        slideOsc.stop(now + 0.13);

        // Bell "Ding"
        const bellOsc = audioCtx.createOscillator();
        const bellGain = audioCtx.createGain();
        bellOsc.type = "sine";
        bellOsc.frequency.setValueAtTime(2800, now); // Metallic high frequency bell
        bellGain.gain.setValueAtTime(0.12, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); // Rings out
        bellOsc.connect(bellGain);
        bellGain.connect(audioCtx.destination);
        bellOsc.start(now);
        bellOsc.stop(now + 0.4);
      } else if (key === "Space" || key === " ") {
        // Lower springy metallic clack
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
        
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, now);

        gainNode.gain.setValueAtTime(0.14, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else {
        // Standard typewriter key stroke
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(500 + Math.random() * 150, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.02);

        // Transient contact tick
        const tick = audioCtx.createOscillator();
        const tickGain = audioCtx.createGain();
        tick.type = "sine";
        tick.frequency.setValueAtTime(2000 + Math.random() * 400, now);
        tickGain.gain.setValueAtTime(0.15, now);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
        tick.connect(tickGain);
        tickGain.connect(audioCtx.destination);
        tick.start(now);
        tick.stop(now + 0.012);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    }
    // --- 2. BUBBLE / POP PROFILE ---
    else if (profile === "bubble") {
      let startFreq = 400;
      let endFreq = 1200;
      let duration = 0.05;
      let gainVal = 0.16;

      if (key === "Space" || key === " ") {
        startFreq = 220;
        endFreq = 500;
        duration = 0.07;
        gainVal = 0.2;
      } else if (key === "Enter") {
        startFreq = 280;
        endFreq = 850;
        duration = 0.07;
        gainVal = 0.18;
      } else {
        startFreq = 350 + Math.random() * 80;
        endFreq = 950 + Math.random() * 250;
        duration = 0.038 + Math.random() * 0.008;
        gainVal = 0.12 + Math.random() * 0.03;
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = "sine"; // Sine wave for clean bubbly pop
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.75);
      
      gainNode.gain.setValueAtTime(gainVal, now);
      gainNode.gain.linearRampToValueAtTime(gainVal * 0.8, now + duration * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + duration + 0.01);
    }
    // --- 3. DIGITAL / CLICK TICK PROFILE ---
    else if (profile === "digital") {
      let frequency = 1900;
      let duration = 0.006;
      let gainVal = 0.12;

      if (key === "Space" || key === " ") {
        frequency = 1200;
        duration = 0.012;
        gainVal = 0.15;
      } else if (key === "Enter") {
        frequency = 1500;
        duration = 0.015;
        gainVal = 0.16;
      } else {
        frequency = 1700 + Math.random() * 300;
        duration = 0.005 + Math.random() * 0.003;
        gainVal = 0.09 + Math.random() * 0.03;
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, now);
      
      gainNode.gain.setValueAtTime(gainVal, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + duration + 0.005);
    }
    // --- 4. STANDARD MECHANICAL PROFILE (DEFAULT) ---
    else {
      let frequency = 400;
      let duration = 0.05;
      let clickGain = 0.14;

      if (key === "Space" || key === " ") {
        frequency = 170;
        duration = 0.08;
        clickGain = 0.18;
      } else if (key === "Enter") {
        frequency = 240;
        duration = 0.08;
        clickGain = 0.2;
      } else if (key === "Backspace") {
        frequency = 300;
        duration = 0.06;
        clickGain = 0.14;
      } else {
        frequency = 360 + Math.random() * 80;
        duration = 0.04 + Math.random() * 0.01;
        clickGain = 0.1 + Math.random() * 0.03;
      }

      // Mechanical Clack (Triangle Oscillator with sweep)
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency * 2.2, now); // Sweep down
      osc.frequency.exponentialRampToValueAtTime(frequency, now + 0.015);

      gainNode.gain.setValueAtTime(clickGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // High-Frequency Contact Tick
      const tickOsc = audioCtx.createOscillator();
      const tickGain = audioCtx.createGain();

      tickOsc.type = "sine";
      tickOsc.frequency.setValueAtTime(1400 + Math.random() * 300, now);
      tickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.004);

      tickGain.gain.setValueAtTime(clickGain * 1.6, now);
      tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      tickOsc.connect(tickGain);
      tickGain.connect(audioCtx.destination);

      // Trigger oscillations
      osc.start(now);
      osc.stop(now + duration);

      tickOsc.start(now);
      tickOsc.stop(now + 0.01);
    }
  } catch (e) {
    console.warn("Audio synthesis is not supported in this environment:", e);
  }
};
