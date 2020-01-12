
export let planets = [
    'Sun','Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'
];

export let radii = {
    'Sun': 695700,
    'Mercury': 2440,
    'Venus': 6052,
    'Earth': 6371,
    'Mars': 3390,
    'Jupiter': 69911,
    'Saturn': 58232,
    'Uranus': 25362,
    'Neptune': 24622,
    'Pluto': 1186
};

export let AU = 149597870.7; // km

export let color = {
    'Sun': 0xfff000,
    'Mercury': 0x5c5c5c,
    'Venus': 0xb39c52,
    'Earth': 0x517fb3,
    'Mars': 0xb35651,
    'Jupiter': 0xb39c52,
    'Saturn': 0xcdc555,
    'Uranus': 0x55a9cd,
    'Neptune': 0x555ccd,
    'Pluto': 0xbbaba1
}

// OG https://ssd.jpl.nasa.gov/txt/p_elem_t1.txt
//                  Semi Major Axis       Ecc              Inc            Mean Lon    Lon of Perihelion   Lon of the Asc. Node
let keplerianElements = {
    'Mercury': {
        'elements': [ 0.38709927,      0.20563593,      7.00497902,      252.25032350,    77.45779628,     48.33076593],
        'rates':    [ 0.00000037,      0.00001906,     -0.00594749,   149472.67411175,     0.16047689,     -0.12534081]
    },
    'Venus': {
        'elements': [ 0.72333566,      0.00677672,      3.39467605,      181.97909950,    131.60246718,     76.67984255],
        'rates':    [ 0.00000390,     -0.00004107,     -0.00078890,    58517.81538729,      0.00268329,     -0.27769418]
    },
    'Earth': {
        'elements': [ 1.00000261,      0.01671123,     -0.00001531,      100.46457166,    102.93768193,      0.0],
        'rates':    [ 0.00000562,     -0.00004392,     -0.01294668,    35999.37244981,      0.32327364,      0.0]
    },
    'Mars': {
        'elements': [ 1.52371034,      0.09339410,      1.84969142,       -4.55343205,    -23.94362959,     49.55953891],
        'rates':    [ 0.00001847,      0.00007882,     -0.00813131,    19140.30268499,      0.44441088,     -0.29257343]
    },
    'Jupiter': {
        'elements': [ 5.20288700,      0.04838624,      1.30439695,       34.39644051,     14.72847983,    100.47390909],
        'rates':    [-0.00011607,     -0.00013253,     -0.00183714,     3034.74612775,      0.21252668,      0.20469106]
    },
    'Saturn': {
        'elements': [ 9.53667594,      0.05386179,      2.48599187,       49.95424423,     92.59887831,    113.66242448],
        'rates':    [-0.00125060,     -0.00050991,      0.00193609,     1222.49362201,     -0.41897216,     -0.28867794]
    },
    'Uranus': {
        'elements': [19.18916464,      0.04725744,      0.77263783,      313.23810451,    170.95427630,     74.01692503],
        'rates':    [-0.00196176,     -0.00004397,     -0.00242939,      428.48202785,      0.40805281,      0.04240589]
    },
    'Neptune': {
        'elements': [30.06992276,      0.00859048,      1.77004347,      -55.12002969,     44.96476227,    131.78422574],
        'rates':    [ 0.00026291,      0.00005105,      0.00035372,      218.45945325,     -0.32241464,     -0.00508664]
    },
    'Pluto': {
        'elements': [39.48211675,      0.24882730,     17.14001206,      238.92903833,    224.06891629,    110.30393684],
        'rates':    [-0.00031596,      0.00005170,      0.00004818,      145.20780515,     -0.04062942,     -0.01183482]
    }
}

function cos(deg) {
    let rad = deg * Math.PI / 180.0;
    return 180.0 / Math.PI * Math.cos(rad);
}
function sin(deg) {
    let rad = deg * Math.PI / 180.0;
    return 180.0 / Math.PI * Math.sin(rad);
}

export function prop(planet, times, transform=undefined) {
    if(transform == undefined) {
        transform = (d) => {return d};
    }
    let x_pts = [];
    let y_pts = [];
    let z_pts = [];
    let t_pts = [];
    for(let cur_t of times) {
        let [x,y,z] = calcCoords(planet, cur_t.valueOf());
        x_pts.push(x);
        y_pts.push(y);
        z_pts.push(z);
    }
    return {
            x_pts: x_pts,
            y_pts: y_pts,
            z_pts: z_pts,
            } 
}
// OG method https://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
export function calcCoords(planet, time_ms) {
    // Calculate the heliocentric coordinates of the given planet at time_ms.

    let t_eph = time_ms / (86400*1000) + 2440587.5; // Not technically correct, but y'know...
    let [a0,e0,I0,L0,wbar0,O0] = keplerianElements[planet].elements;
    let [da0,de0,dI0,dL0,dwbar0,dO0] = keplerianElements[planet].rates;

    // 1.
    // T = Number of centuries past J2000.
    let T = (t_eph - 2451545.0)/36525;
    // Six Keplerian elements
    let a = a0 + da0*T;
    let e = e0 + de0*T;
    let I = I0 + dI0*T;
    let L = L0 + dL0*T;
    let wbar = wbar0 + dwbar0*T;
    let O = O0 + dO0*T;

    // 2.
    // w = Argument of perihelion
    let w = wbar - O;
    // M = Mean anomaly
    let M = L - wbar;

    // 3. Solve Kepler's equation
    // Modulus the mean anomaly so that -180 < M < 180
    //M = M % 180;
    M = M % 360; //((M - 180) % 360) + 180;
    let E = kepler_Newton(e,M,10e-6,20);

    // 4. Planet's heliocentric coords in its orbital plane, with the x' axis aligned from the focus to the perihelion.
    let xprime = a*(cos(E) - e);
    let yprime = a*Math.sqrt(1 - e^2)*sin(E);
    let zprime = 0;

    return [xprime,yprime,zprime];
    //return [xprime*AU,yprime*AU,zprime*AU];
    //// 5. Compute the coords r_ecl in the J2000 ecliptic plane, with the x-axis aligned toward the equinox.
    //let x_ecl = (cos(w)*cos(O)-sin(w)*sin(O)*cos(I))*xprime + (-sin(w)*cos(O)-cos(w)*sin(O)*cos(I))*yprime;
    //let y_ecl = (cos(w)*sin(O)+sin(w)*cos(O)*cos(I))*xprime + (-sin(w)*sin(O)+cos(w)*cos(O)*cos(I))*yprime;
    //let z_ecl = (sin(w)*sin(I))*xprime + (cos(w)*sin(I))*yprime;

    //return [x_ecl*AU,y_ecl*AU,z_ecl*AU];
}

function kepler_Newton(e,M,tol,max_iter) {
    let M_rad = M * Math.PI / 180;
    let E = M_rad;
    if(e > 0.8) {
        E = Math.PI;
    }
    let dE = 0;
    let i = 0;
    let fE = E - e*Math.sin(E) - M_rad;
    while(fE > tol && i < max_iter) {
        dE = (E - e*Math.sin(M_rad) - M_rad) / (1 - e*Math.cos(E));
        E = E - dE;
        fE = E - e*Math.sin(E) - M_rad;
    }
    return E * 180 / Math.PI;
}
function kepler_FixedPointIteration(e,M,n) {
    let M_rad = M * Math.PI / 180;
    let E = M_rad;
    for(let i = 0; i < n; i++) {
        E = M_rad + e*Math.sin(E);
    }
    return E * 180 / Math.PI;
}