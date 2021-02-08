document.body.insertAdjacentHTML('beforeend', `<style>* { --theme-color: ${'#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}</style>`);

let center = document.getElementById('center');

(function initWebsiteImporting() {
    let websites = [...document.getElementsByTagName('import_website')];
    let links = [...document.getElementsByClassName('openWebsite')];

    document.addEventListener('click', (event) => {
        if (!event.target.matches('import_website') && !event.target.matches('import_website > *') && !event.target.matches('a')) {
            websites.forEach((website) => website.style.opacity = '0');
            center.style.opacity = '1';
        }
    });

    websites.forEach((website) => {
        let href = website.getAttribute('href');

        setTimeout(() => {
            website.style.display = 'block';
        },1000);

        website.className += ' website';

        links.forEach((link) => {
            if (link.href.includes(`#${href}#`)) {
                link.addEventListener('mouseup', (event) => {
                    websites.forEach((w) => {
                        if (w.style.opacity === '1' && w != website) {
                            w.style.opacity = '0';
                            center.style.opacity = '1';
                        }
                    });

                    if (website.className.includes('centred'))
                        center.style.opacity = 0;
                    website.style.opacity = website.style.opacity === '1' ? '0' : '1';
                });
            }
        });

        if (href) fetch(href)
            .then((response) => response.text())
            .then((html) => {
                website.insertAdjacentHTML('beforeend', `<!--This content is loaded from ${href}-->\n${html}<!-- End of ${href} content -->`);
                let scripts = [...website.getElementsByTagName('script')];
                scripts.forEach((script) => eval(script.innerHTML));
            })
            .catch((err) => {
                //
            });
    });

})();


(function initStarBackground() {
    let canvas = document.getElementById('starfieldBackground'),
        context = canvas.getContext('2d');
    
    class MousePos {
        static x = -500;
        static dX = 0;
        static y = -500;
        static dY = 0;
        static inBounds = false;

        static #initialize = (() => {
            document.addEventListener('mousemove', (event) => {
                this.dX = event.pageX-this.x;
                this.dY = event.pageY-this.y;
                this.x = event.pageX;
                this.y = event.pageY;
                this.inBounds = true;
            }, false);

            document.addEventListener('mouseout', (event) => {
                this.x = -500;
                this.dX = 0;
                this.y = -500;
                this.dY = 0;
                this.inBounds = false;
            }, false);
        })();

        static distance(position) {
            let x = position.x,
                y = position.y;

            return Math.sqrt((this.x - x)**2 + (this.y - y)**2);
        }
    }

    class Star {
        x = 0;
        y = 0;
        minSpeed = 0.3;
        maxSpeed = 150;
        friction = 0.9;
        velocity = {
            x: 0,
            y: 0
        };
        distance = 0;

        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        addVelocity(x, y) {
            this.velocity.x += x;
            this.velocity.y += y;
            this.clampVelocity();
        }

        clampVelocity() {
            for (let variable in this.velocity) {
                if (this.velocity[variable] > 0)
                    this.velocity[variable] = Math.min(Math.max(this.velocity[variable], this.minSpeed), this.maxSpeed);
                else
                    this.velocity[variable] = Math.max(Math.min(this.velocity[variable], -this.minSpeed), -this.maxSpeed);
            }
        }

        update() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;

            if (Math.abs(this.velocity.x) <= this.minSpeed && Math.abs(this.velocity.y) <= this.minSpeed) {
                let randomnessX = Math.random() * 0.2;
                let randomnessY = Math.random() * 0.2;
                let x = Math.random();
                this.addVelocity(x > 0.5 ? randomnessX : -randomnessX, x > 0.5 ? randomnessY : -randomnessY);
            }

            this.clampVelocity();

            this.x = this.x <= 0 ? canvas.width : this.x > canvas.width ? 0 : this.x;
            this.y = this.y <= 0 ? canvas.height : this.y > canvas.height ? 0 : this.y;

            this.distance = MousePos.distance({x:this.x, y:this.y});
            let tone = Math.min(64/this.distance, 1)*255;
            let threeshold = 150;

            if (tone > threeshold) {
                this.velocity.x += (MousePos.x-this.x)*0.002;
                this.velocity.y += (MousePos.y-this.y)*0.002;
            }

            this.draw(
                Math.min(Math.max(110-this.distance, 3),5),
                `rgb(${tone}, ${tone}, ${tone})`,
                tone > threeshold
            );
        }


        draw(size, color, marked) {
            context.beginPath();
            context.fillStyle = color;
            context.arc(this.x, this.y, size, 0, Math.PI*2);
            context.fill();
            if (marked) {
                context.beginPath();
                context.strokeStyle = color;
                context.lineWidth = 3;
                context.moveTo(MousePos.x, MousePos.y);
                context.lineTo(this.x, this.y);
                context.stroke();
            }
        }
    }

    let stars = []
    for (let i = 0; i < 150; ++i) {
        let star = new Star(rand(-canvas.width, canvas.width), rand(-canvas.height,canvas.height));
        star.velocity.x = rand(-star.maxSpeed, star.maxSpeed);
        star.velocity.y = rand(-star.maxSpeed, star.maxSpeed);
        stars.push(star);
    }

    (function setCanvasData() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.fillStyle = 'black';
        context.fillRect(0,0,canvas.width,canvas.height);

        window.addEventListener('resize', (event) => {
            canvas.width = window.innerWidth*0.99;
            canvas.height = window.innerHeight*0.99;
            context.fillStyle = 'black';
            context.fillRect(0,0,canvas.width,canvas.height);
        }, false);
    })();

    let lastTime = 0;
    (function frameUpdate(time) {
        let deltaTime = time-lastTime;

        context.clearRect(0,0,canvas.width,canvas.height)
        stars.forEach((star) => star.update());

        lastTime = time;

        window.requestAnimationFrame(frameUpdate);
    })();

    function rand(min, max) {
        return (Math.random() * (max - min + 1)) + min;
    }
})();