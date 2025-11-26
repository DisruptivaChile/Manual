import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Beams from './backgrounds/Beams';
import Particles from './backgrounds/Particles';
import GridScan from './backgrounds/GridScan';
import Squares from './backgrounds/Squares';
import BlurText from './text-animations/BlurText';
import FuzzyText from './text-animations/FuzzyText';
import ScrollReveal from './text-animations/ScrollReveal';
import RotatingText from './text-animations/RotatingText';
import CurvedLoop from './text-animations/CurvedLoop';
import TextType from './text-animations/TextType';
import Carousel from './components/Carousel';
import './App.css'

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [slide3TextIndex, setSlide3TextIndex] = useState(0);
  const [horizontalSlide, setHorizontalSlide] = useState(0); // 0 = slide 3, 1 = slide 4
  const [showSlide3Button, setShowSlide3Button] = useState(false);
  const [showSlide4Answer, setShowSlide4Answer] = useState(false);
  const [showSlide4Text, setShowSlide4Text] = useState(false);
  const [showSlide4SecondQuestion, setShowSlide4SecondQuestion] = useState(false);
  const [showSlide4SecondAnswer, setShowSlide4SecondAnswer] = useState(false);
  const [showSlide5Button, setShowSlide5Button] = useState(false);
  const isScrolling = useRef(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const slide3TimerRef = useRef(null);
  const slide4TimerRef = useRef(null);

  const totalSlides = 3;
  const slide3Texts = [
    "¿Qué Hacemos?",
    "Texto de prueba 1",
    "Texto de prueba 2",
    "Texto de prueba 4"
  ];

  // Click Spark Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    let animationId;

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= 400) return false;

        const progress = elapsed / 400;
        const eased = progress * (2 - progress);
        const distance = eased * 20;
        const lineLength = 10 * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    const handleClick = (e) => {
      const now = performance.now();
      const newSparks = Array.from({ length: 8 }, (_, i) => ({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / 8,
        startTime: now
      }));
      sparksRef.current.push(...newSparks);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Timer para mostrar el botón "Descubre más" después de 5 segundos en slide 3
  useEffect(() => {
    console.log('Timer effect - currentSlide:', currentSlide, 'horizontalSlide:', horizontalSlide);
    if (currentSlide === 2 && horizontalSlide === 0) {
      console.log('Setting timer for button...');
      slide3TimerRef.current = setTimeout(() => {
        console.log('Timer complete! Showing button');
        setShowSlide3Button(true);
      }, 2000);
    } else {
      setShowSlide3Button(false);
      if (slide3TimerRef.current) {
        clearTimeout(slide3TimerRef.current);
      }
    }

    return () => {
      if (slide3TimerRef.current) {
        clearTimeout(slide3TimerRef.current);
      }
    };
  }, [currentSlide, horizontalSlide]);

  // Timer para mostrar el texto en slide 4 después de 1 segundo
  useEffect(() => {
    if (currentSlide === 2 && horizontalSlide === 1) {
      slide4TimerRef.current = setTimeout(() => {
        setShowSlide4Text(true);
      }, 1000);
    } else {
      setShowSlide4Text(false);
      setShowSlide4Answer(false);
      setShowSlide4SecondQuestion(false);
      setShowSlide4SecondAnswer(false);
      if (slide4TimerRef.current) {
        clearTimeout(slide4TimerRef.current);
      }
    }

    return () => {
      if (slide4TimerRef.current) {
        clearTimeout(slide4TimerRef.current);
      }
    };
  }, [currentSlide, horizontalSlide]);

  // Timer para mostrar el botón "¿Quieres postular?" después de 1 segundo
  useEffect(() => {
    if (showSlide4SecondQuestion) {
      const timer = setTimeout(() => {
        setShowSlide5Button(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowSlide5Button(false);
    }
  }, [showSlide4SecondQuestion]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling.current) return;

      e.preventDefault();
      isScrolling.current = true;

      // Si estamos en el slide 3, manejar el scroll interno de textos
      if (currentSlide === 2) {
        // Detectar scroll horizontal (Shift + Wheel o trackpad horizontal)
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          if (e.deltaX > 0 && horizontalSlide === 0) {
            setHorizontalSlide(1); // Ir al slide 4 (derecha)
          } else if (e.deltaX < 0 && horizontalSlide === 1) {
            setHorizontalSlide(0); // Volver al slide 3
          }
        } else {
          // Scroll vertical en slide 3
          if (horizontalSlide === 0) {
            if (e.deltaY > 0 && slide3TextIndex < slide3Texts.length - 1) {
              setSlide3TextIndex(prev => prev + 1);
            } else if (e.deltaY < 0 && slide3TextIndex > 0) {
              setSlide3TextIndex(prev => prev - 1);
            } else if (e.deltaY < 0 && slide3TextIndex === 0 && currentSlide > 0) {
              // Si estamos en el primer texto del slide 3 y scrolleamos hacia arriba, volver al slide anterior
              setCurrentSlide(prev => prev - 1);
              setShowDescription(false);
            }
          }
        }
      } else {
        // Comportamiento normal de cambio de slides
        if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
          setCurrentSlide(prev => prev + 1);
          if (currentSlide + 1 === 2) {
            setSlide3TextIndex(0); // Reset slide 3 text index
          }
        } else if (e.deltaY < 0 && currentSlide > 0) {
          setCurrentSlide(prev => prev - 1);
          setShowDescription(false);
        }
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentSlide, totalSlides, slide3TextIndex, slide3Texts.length, horizontalSlide]);

  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
      setShowDescription(false);
    }
  };

  return (
    <>
      <canvas 
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />
      
      {/* Botón "Descubre más" - Al nivel más alto */}
      {currentSlide === 2 && horizontalSlide === 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 1, ease: "easeOut", delay: 2 }}
          onClick={() => {
            setHorizontalSlide(1);
          }}
          style={{
            position: 'fixed',
            right: '6rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0.5rem 1.2rem',
            fontSize: '0.9rem',
            fontWeight: '400',
            color: 'rgba(255, 255, 255, 0.7)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10000,
            pointerEvents: 'auto',
            transition: 'all 0.3s ease',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
          }}
        >
          Descubre más →
        </motion.div>
      )}

      {/* Botón "Regresar" - Esquina izquierda en slide 4 */}
      {currentSlide === 2 && horizontalSlide === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 1, ease: "easeOut", delay: 2 }}
          onClick={() => {
            setHorizontalSlide(0);
          }}
          style={{
            position: 'fixed',
            left: '6rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0.5rem 1.2rem',
            fontSize: '0.9rem',
            fontWeight: '400',
            color: 'rgba(255, 255, 255, 0.7)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10000,
            pointerEvents: 'auto',
            transition: 'all 0.3s ease',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
          }}
        >
          ← Regresar
        </motion.div>
      )}

      <div className="app-container" ref={containerRef}>
        <div className="slides-wrapper" style={{ transform: `translateY(-${currentSlide * 100}vh)` }}>
          {/* Slide 1 */}
          <div className="slide">
            <div className="background-wrapper">
              <Beams
                beamWidth={2}
                beamHeight={15}
                beamNumber={12}
                lightColor="#ffffff"
                speed={2}
                noiseIntensity={1.75}
                scale={0.2}
                rotation={0}
              />
            </div>
            <div className="content">
              <h1>DISRUPTIVA</h1>
              <BlurText
                text="Acelera. Domina. Gana."
                delay={500}
                animateBy="words"
                direction="top"
                className="subtitle"
                initialDelay={1000}
              />
              <div className="ready-text" onClick={goToNextSlide} style={{ cursor: 'pointer' }}>
                <FuzzyText
                  fontSize="1.5rem"
                  fontWeight={500}
                  color="#fff"
                  enableHover={true}
                  baseIntensity={0.2}
                  hoverIntensity={0.5}
                >
                  ¿Preparado?
                </FuzzyText>
              </div>
            </div>
          </div>

          {/* Slide 2 */}
          <div className="slide" style={{ backgroundColor: '#000000' }}>
            <div className="background-wrapper">
              <Particles
                particleColors={['#ffffff', '#ffffff']}
                particleCount={200}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
              />
            </div>
            <div className="content">
              <AnimatePresence mode="wait">
                {currentSlide === 1 && !showDescription && (
                  <motion.div
                    key="slide2-title"
                    initial={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    exit={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="subtitle"
                  >
                    ¿Quiénes somos?
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!showDescription ? (
                <AnimatePresence mode="wait">
                  {currentSlide === 1 && (
                    <motion.button
                      key="slide2-button"
                      initial={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      exit={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      onClick={() => setShowDescription(true)}
                      style={{
                        marginTop: '2rem',
                        padding: '1rem 2rem',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#fff',
                        background: 'transparent',
                        border: '2px solid #fff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.color = '#000';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#fff';
                      }}
                    >
                      Click
                    </motion.button>
                  )}
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  {currentSlide === 1 && (
                    <motion.div
                      key="slide2-description"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ 
                        marginTop: '2rem', 
                        maxWidth: '900px', 
                        textAlign: 'center',
                        padding: '0 2rem'
                      }}
                    >
                      <BlurText
                        text="DISRUPTIVA Consultores es el motor de crecimiento de tu pyme. De la mano de estrategias disruptivas y marketing 360 (digital y físico), te llevamos a la cima del entorno económico. ¡Sigue Scrolleando para saber más!"
                        delay={50}
                        animateBy="words"
                        direction="top"
                        className="description-text"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Slide 3 - Container Horizontal */}
          <div className="slide" style={{ backgroundColor: '#000000', overflow: 'hidden', position: 'relative' }}>
            <div 
              className="horizontal-slides-wrapper"
              style={{
                display: 'flex',
                width: '200vw',
                height: '100vh',
                transform: `translateX(-${horizontalSlide * 100}vw)`,
                transition: 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
                overflow: 'hidden',
              }}
            >
              {/* Slide 3a - Original */}
              <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <div className="background-wrapper">
                  <GridScan
                    key="gridscan-slide3-v2"
                    sensitivity={0.55}
                    lineThickness={0.8}
                    linesColor="#1a1525"
                    gridScale={0.1}
                    scanColor="#b8b8b8"
                    scanOpacity={0.15}
                    enablePost
                    bloomIntensity={0.1}
                    chromaticAberration={0.0005}
                    noiseIntensity={0.005}
                    scanDuration={2.0}
                    scanDelay={20.0}
                  />
                </div>
                <div className="content">
                  <AnimatePresence mode="wait">
                    {currentSlide === 2 && slide3TextIndex === 0 && (
                      <motion.div
                        key="slide3-text-0"
                        initial={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        exit={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                        transition={{ duration: 0.6 }}
                        className="subtitle"
                      >
                        ¿Qué Hacemos?
                      </motion.div>
                    )}
                    {currentSlide === 2 && slide3TextIndex === 1 && (
                      <motion.div
                        key="slide3-text-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                          height: '600px', 
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%'
                        }}
                      >
                        <Carousel
                          baseWidth={500}
                          autoplay={true}
                          autoplayDelay={3000}
                          pauseOnHover={true}
                          loop={true}
                          round={true}
                        />
                      </motion.div>
                    )}
                    {currentSlide === 2 && slide3TextIndex === 2 && (
                      <motion.div
                        key="slide3-text-2"
                        initial={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        exit={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                        transition={{ duration: 0.6 }}
                        className="subtitle"
                      >
                        ¿Por qué funciona?
                      </motion.div>
                    )}
                    {currentSlide === 2 && slide3TextIndex === 3 && (
                      <motion.div
                        key="slide3-text-3"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.6 }}
                        className="subtitle"
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <RotatingText
                          texts={[
                            'Metodología validada con empresas reales',
                            'Equipo experto en negocios, tecnología y marketing',
                            'Uso de herramientas modernas',
                            'Conectamos universidades, fondos y mercados globales',
                            'Te ayudamos a escalar sin fricciones'
                          ]}
                          mainClassName="rotating-text-container"
                          staggerFrom="last"
                          staggerDuration={0.025}
                          splitLevelClassName="overflow-hidden"
                          rotationInterval={5000}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Slide 4 - Nuevo slide horizontal */}
              <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <div className="background-wrapper">
                  <Squares 
                    speed={0.5} 
                    squareSize={40}
                    direction='diagonal'
                    borderColor='rgba(255, 255, 255, 0.15)'
                    hoverFillColor='rgba(255, 255, 255, 0.05)'
                  />
                </div>
                <div className="content">
                  <AnimatePresence mode="wait">
                    {!showSlide4Answer && (
                      <motion.div
                        key="slide4-content"
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6 }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <CurvedLoop 
                          marqueeText="Te ayudamos a escalar sin fricciones ✦"
                          speed={2}
                          curveAmount={0}
                          direction="left"
                          interactive={true}
                        />
                        
                        {showSlide4Text && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            onClick={() => setShowSlide4Answer(true)}
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '42%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '2.5rem',
                              fontWeight: '700',
                              color: 'white',
                              textAlign: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <TextType 
                              text={["¿Cuánto cuesta?"]}
                              typingSpeed={75}
                              pauseDuration={1500}
                              showCursor={true}
                              cursorCharacter="|"
                              loop={false}
                              initialDelay={0}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    
                    {showSlide4Answer && !showSlide4SecondQuestion && (
                      <motion.div
                        key="slide4-answer"
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8 }}
                        style={{ 
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          maxWidth: '900px', 
                          textAlign: 'center',
                          padding: '0 2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2rem'
                        }}
                      >
                        <div>
                          <BlurText
                            text="$0 de inversión fija."
                            delay={30}
                            animateBy="words"
                            direction="top"
                            className="subtitle"
                            style={{
                              fontSize: '3rem',
                              fontWeight: '700',
                              marginBottom: '1rem'
                            }}
                          />
                        </div>
                        <div>
                          <BlurText
                            text="Sólo cobramos un 20% - 25% de las ventas netas generadas por los canales que activamos o potenciamos contigo."
                            delay={50}
                            animateBy="words"
                            direction="top"
                            className="description-text"
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: '400',
                              lineHeight: '1.8'
                            }}
                          />
                        </div>
                        
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 1 }}
                          onClick={() => setShowSlide4SecondQuestion(true)}
                          style={{
                            marginTop: '1rem',
                            padding: '0.8rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#fff',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          }}
                        >
                          ¿Qué esperamos de ti?
                        </motion.button>
                      </motion.div>
                    )}
                    
                    {showSlide4SecondQuestion && (
                      <motion.div
                        key="slide4-second-answer"
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8 }}
                        style={{ 
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          maxWidth: '800px', 
                          textAlign: 'left',
                          padding: '0 2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.5rem'
                        }}
                      >
                        <BlurText
                          text="Tiempo: al menos 1 reunión semanal"
                          delay={40}
                          animateBy="words"
                          direction="top"
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            lineHeight: '1.8'
                          }}
                        />
                        <BlurText
                          text="Compromiso: apertura a implementar y probar"
                          delay={40}
                          animateBy="words"
                          direction="top"
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            lineHeight: '1.8'
                          }}
                        />
                        <BlurText
                          text="Transparencia: acceso a información clave de ventas y procesos"
                          delay={40}
                          animateBy="words"
                          direction="top"
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            lineHeight: '1.8'
                          }}
                        />
                        
                        {showSlide5Button && (
                          <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            onClick={() => {
                              const phoneNumber = '56977993047';
                              const message = encodeURIComponent('Hola, estoy interesado en hacer crecer mi negocio, ¿Por dónde empezamos?');
                              window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                            }}
                            style={{
                              marginTop: '1rem',
                              padding: '0.8rem 2rem',
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: '#fff',
                              background: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              alignSelf: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                            }}
                          >
                            ¿Quieres postular?
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Botón "Volver a inicio" - Esquina inferior derecha */}
                  {showSlide4SecondQuestion && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 2 }}
                      onClick={() => {
                        setCurrentSlide(0);
                        setHorizontalSlide(0);
                        setShowSlide4Answer(false);
                        setShowSlide4SecondQuestion(false);
                        setShowSlide5Button(false);
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '3rem',
                        right: '3rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '400',
                        color: 'rgba(255, 255, 255, 0.6)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.05em',
                        pointerEvents: 'auto',
                        zIndex: 100
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      }}
                    >
                      Volver a inicio
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
