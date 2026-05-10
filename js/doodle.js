const valentineDoodles = {
  hearts: `
    --color: #51eaea, #fffde1, #ff9d76, #FB3569;

    @grid: 30x1 / 100vw 100vh / #270f34;

    :container {
      perspective: 30vmin;
      --deg: @p(-180deg, 180deg);
    }

    :after, :before {
      content: '';
      background: @p(--color);
      @place: @r(100%) @r(100%);
      @size: @r(6px);
      @shape: heart;
    }

    @place: center;
    @size: 18vmin;

    box-shadow: @m2(0 0 50px @p(--color));
    background: @m100(
      radial-gradient(@p(--color) 50%, transparent 0)
      @r(-20%, 120%) @r(-20%, 100%) / 1px 1px
      no-repeat
    );

    will-change: transform, opacity;
    animation: scale-up 12s linear infinite;
    animation-delay: calc(-12s / @I * @i);

    @keyframes scale-up {
      0%, 95.01%, 100% {
        transform: translateZ(0) rotate(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      95% {
        transform:
          translateZ(35vmin) rotateZ(var(--deg));
      }
    }
  `,
  sparkles: `
    --color: #fffde1, #51eaea, #FB3569, #ff9d76;

    @grid: 42x1 / 100vw 100vh / #160828;

    :container {
      perspective: 42vmin;
      filter: saturate(1.25);
    }

    @place: @r(100%) @r(100%);
    @size: @r(2px, 7px);
    background: @p(--color);
    border-radius: 50%;
    box-shadow: 0 0 @r(12px, 34px) @p(--color);
    opacity: 0;
    will-change: transform, opacity;
    animation: twinkle 4.5s linear infinite;
    animation-delay: calc(-4.5s / @I * @i);

    :after {
      content: '';
      @place: center;
      @size: 360%;
      background: inherit;
      clip-path: polygon(50% 0, 58% 38%, 100% 50%, 58% 62%, 50% 100%, 42% 62%, 0 50%, 42% 38%);
      opacity: 0.55;
    }

    @keyframes twinkle {
      0%, 100% {
        opacity: 0;
        transform: translateY(8vmin) scale(0.4) rotate(0);
      }
      35%, 75% {
        opacity: 1;
      }
      95% {
        opacity: 0;
        transform: translateY(-35vmin) scale(1.45) rotate(220deg);
      }
    }
  `,
  bubbles: `
    --color: rgba(255, 253, 225, 0.9), rgba(81, 234, 234, 0.75), rgba(251, 53, 105, 0.65);

    @grid: 36x1 / 100vw 100vh / linear-gradient(180deg, #270f34, #12061e);

    @place: @r(100%) 110%;
    @size: @r(14px, 58px);
    background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), @p(--color) 34%, transparent 68%);
    border: 1px solid rgba(255, 253, 225, 0.25);
    border-radius: 50%;
    opacity: 0;
    will-change: transform, opacity;
    animation: float-up 9s ease-in infinite;
    animation-delay: calc(-9s / @I * @i);

    @keyframes float-up {
      0%, 100% {
        opacity: 0;
        transform: translate3d(0, 0, 0) scale(0.65);
      }
      15%, 80% {
        opacity: 0.75;
      }
      95% {
        opacity: 0;
        transform: translate3d(@r(-24vmin, 24vmin), -118vh, 0) scale(1.1);
      }
    }
  `
};

const getSavedBackground = () => localStorage.getItem('valentine-background') || 'hearts';

const updateValentineDoodle = (name) => {
  const effect = valentineDoodles[name] ? name : 'hearts';
  const doodle = document.getElementById('valentine-doodle');

  doodle.update(valentineDoodles[effect]);
  localStorage.setItem('valentine-background', effect);

  return effect;
};

customElements.whenDefined('css-doodle').then(() => {
  updateValentineDoodle(getSavedBackground());
});

window.setValentineBackground = updateValentineDoodle;
