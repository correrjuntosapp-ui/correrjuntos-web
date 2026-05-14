// Generate the 5 remaining EN landings using 10k/index.html as template
// Replaces only the per-distance values and keeps shared structure
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'planes', 'en', '10k', 'index.html');

const variants = [
  {
    slug: '5k', esSlug: '5k',
    distance: '5K',
    title: 'Adaptive 5K Plan (4-14 Weeks) — Ends on Race Day | CorrerJuntos',
    desc: 'A 5K plan that fits your race date. 4 to 14 weeks based on your calendar, last week tapered. Intervals, tempo and long runs. Free download.',
    ogTitle: 'Adaptive 5K Plan — Ends on Race Day | CorrerJuntos',
    ogDesc: 'A 5K plan that fits your race date. 4 to 14 weeks, last week tapered.',
    breadcrumb: '5K Plan',
    h1: 'A 5K plan that ends<br>on your <em style="font-style:normal;color:#f97316">race day</em>',
    sub: 'Set your race date. We generate a plan of <strong>4 to 14 weeks</strong> that ends exactly on race day &mdash; with the last week tapered. No gaps. No improvising.',
    weeksRange: '4-14',
    sessionsPerWeek: '4',
    minWeeks: 4,
    canonicalWeeks: 8,
    audience: 'Recreational to intermediate runner',
    audienceLines: [
      '<li><strong>You can already run 3-5 km:</strong> some base fitness, looking to race a fast 5K</li>',
      '<li><strong>Want a personal best:</strong> structured intervals, tempo, and race-day pacing</li>',
      '<li><strong>4 running days per week:</strong> roughly 3-4 hours of dedicated training</li>',
      '<li><strong>Comfortable with intervals:</strong> short, fast efforts with full recovery</li>',
    ],
    phases: [
      ['Base', '1-2', 'Easy 30-40 min runs at conversational pace. Build aerobic base. Long run 5-7 km.'],
      ['Intervals', '3-5', '200-600m intervals at 5K pace. Improve VO2max and turnover.'],
      ['Tempo &amp; race-pace', '6-7', 'Sustained tempo efforts and 5K race-pace blocks. Time trial mid-block.'],
      ['Taper', '8 (last)', '40% volume reduction. Short activations. Fresh legs for race day.'],
    ],
    weekTitle: 'Sample week (week 5)',
    weekDays: [
      ['Monday', 'Rest'],
      ['Tuesday', '35 min easy + 6x100m strides'],
      ['Wednesday', 'Rest or strength/core'],
      ['Thursday', '8x400m at 5K pace (90s recovery jog)'],
      ['Friday', 'Rest'],
      ['Saturday', '25 min easy run'],
      ['Sunday', '6 km long run with 2 km at 5K pace'],
    ],
  },

  {
    slug: '0-5k', esSlug: '0-5k',
    distance: '5K (couch to)',
    title: 'Adaptive Couch-to-5K Plan (4-12 Weeks) — Start Running Free | CorrerJuntos',
    desc: 'Free couch-to-5K plan that adapts to your goal date. 4 to 12 weeks based on your calendar. 3 sessions per week. No experience needed. Free download.',
    ogTitle: 'Adaptive Couch-to-5K Plan — Free | CorrerJuntos',
    ogDesc: 'A free plan that fits your goal date. 4 to 12 weeks based on your calendar. No experience needed.',
    breadcrumb: 'Couch-to-5K',
    h1: 'A Couch-to-5K plan that ends<br>on your <em style="font-style:normal;color:#f97316">first race day</em>',
    sub: 'From zero to running 5K. Set your date and the plan scales from <strong>4 to 12 weeks</strong>, progressive walk/run method. No previous experience required.',
    weeksRange: '4-12',
    sessionsPerWeek: '3',
    minWeeks: 4,
    canonicalWeeks: 8,
    audience: 'Complete beginner',
    audienceLines: [
      '<li><strong>You don\'t run yet:</strong> walking is fine, you want to start running gradually</li>',
      '<li><strong>You have a target date:</strong> a first 5K, a charity run, a personal goal</li>',
      '<li><strong>3 days per week:</strong> 25-40 min sessions, mostly walk/run intervals</li>',
      '<li><strong>No prior fitness needed:</strong> the plan progresses from walking to continuous running</li>',
    ],
    phases: [
      ['Walk-run starter', '1-2', 'Alternating walking and short jogging. 6x1 min jog / 1 min walk progressing.'],
      ['Build', '3-5', 'Longer running intervals, less walking recovery. 5x3 min jog / 1 min walk.'],
      ['Continuous', '6-7', 'Run continuously for longer durations. 25-30 min easy.'],
      ['Race week', '8 (last)', 'Lighter sessions, mental preparation. First 5K!'],
    ],
    weekTitle: 'Sample week (week 4)',
    weekDays: [
      ['Monday', 'Rest'],
      ['Tuesday', '6x2 min jog / 1 min walk + cool-down'],
      ['Wednesday', 'Rest or 30 min walk'],
      ['Thursday', '5x3 min jog / 1 min walk'],
      ['Friday', 'Rest'],
      ['Saturday', 'Rest or stretching'],
      ['Sunday', '4x4 min jog / 1 min walk progressive'],
    ],
    isFree: true,
  },

  {
    slug: 'half-marathon', esSlug: 'media-maraton',
    distance: 'Half Marathon (21K)',
    title: 'Adaptive Half Marathon Plan (10-24 Weeks) — Ends on Race Day | CorrerJuntos',
    desc: 'A half marathon plan that fits your race date. 10 to 24 weeks, last week tapered. Long runs, tempo, intervals. Free download.',
    ogTitle: 'Adaptive Half Marathon Plan — Ends on Race Day | CorrerJuntos',
    ogDesc: 'A 21K plan that fits your race date. 10 to 24 weeks, last week tapered.',
    breadcrumb: 'Half Marathon Plan',
    h1: 'A Half Marathon plan that ends<br>on your <em style="font-style:normal;color:#f97316">race day</em>',
    sub: 'Set your race date. We generate a plan of <strong>10 to 24 weeks</strong> that ends exactly on race day &mdash; with the last week tapered. No gaps. No improvising.',
    weeksRange: '10-24',
    sessionsPerWeek: '4',
    minWeeks: 10,
    canonicalWeeks: 16,
    audience: 'Intermediate to advanced',
    audienceLines: [
      '<li><strong>Solid running base:</strong> you currently run 4 days a week and have done a 10K</li>',
      '<li><strong>You want to finish strong or PR:</strong> first 21K or improve your time</li>',
      '<li><strong>4 running days per week:</strong> with one long run on weekends</li>',
      '<li><strong>Time for long runs:</strong> 90+ min easy runs in the last weeks</li>',
    ],
    phases: [
      ['Base', '1-4', 'Easy mileage progression. Build aerobic base. Long runs 10-14 km.'],
      ['Build', '5-8', 'Intervals and tempo. VO2max and threshold development. Long runs to 16 km.'],
      ['Specific', '9-13', 'Race-pace blocks within long runs. Long runs to 18-20 km.'],
      ['Peak', '14-15', 'Highest training load. Sharpening sessions at race pace.'],
      ['Taper', '16 (last)', 'Volume reduction 50% in last week. Short activations. Fresh legs.'],
    ],
    weekTitle: 'Sample week (week 10)',
    weekDays: [
      ['Monday', 'Rest'],
      ['Tuesday', '50 min easy + 8x100m strides'],
      ['Wednesday', 'Rest or strength/core'],
      ['Thursday', '4x2 km at half-marathon pace (90s jog recovery)'],
      ['Friday', 'Rest'],
      ['Saturday', '40 min easy run'],
      ['Sunday', '18 km long run with 6 km at HM pace'],
    ],
  },

  {
    slug: 'marathon', esSlug: 'maraton',
    distance: 'Marathon (42K)',
    title: 'Adaptive Marathon Plan (14-26 Weeks) — Ends on Race Day | CorrerJuntos',
    desc: 'A marathon plan that fits your race date. 14 to 26 weeks based on your calendar, last week tapered. Base, build, peak, taper. Free download.',
    ogTitle: 'Adaptive Marathon Plan — Ends on Race Day | CorrerJuntos',
    ogDesc: 'A marathon plan that fits your race date. 14 to 26 weeks, last week tapered.',
    breadcrumb: 'Marathon Plan',
    h1: 'A Marathon plan that ends<br>on your <em style="font-style:normal;color:#f97316">42K race day</em>',
    sub: 'Set your race date. We generate a plan of <strong>14 to 26 weeks</strong> that ends exactly on race day &mdash; with the last week tapered. No gaps. No improvising. For experienced runners.',
    weeksRange: '14-26',
    sessionsPerWeek: '4',
    minWeeks: 14,
    canonicalWeeks: 18,
    audience: 'Advanced runner',
    audienceLines: [
      '<li><strong>Experienced runner:</strong> you have completed at least one half marathon</li>',
      '<li><strong>4 running days per week:</strong> 5-7 hours of running, plus optional cross-training</li>',
      '<li><strong>You can do long runs:</strong> 2-3 hours on weekends in the peak phase</li>',
      '<li><strong>Time-disciplined:</strong> a 42K demands sustained commitment over months</li>',
    ],
    phases: [
      ['Base', '1-5', 'Aerobic base building. Long runs 14-22 km. Easy mileage progression.'],
      ['Build', '6-10', 'Intervals, hill repeats, sustained tempo. Long runs to 26 km.'],
      ['Specific', '11-15', 'Marathon-pace blocks within long runs. Long runs to 30-32 km.'],
      ['Peak', '16-17', 'Highest training load. Final sharpening before taper.'],
      ['Taper', '18 (last)', 'Progressive 50% volume reduction. Short race-pace activations. Fueling practice.'],
    ],
    weekTitle: 'Sample week (week 13)',
    weekDays: [
      ['Monday', 'Rest'],
      ['Tuesday', '60 min easy + 8x100m strides'],
      ['Wednesday', 'Rest or strength/core'],
      ['Thursday', '6x1 km at marathon pace + 3 km tempo'],
      ['Friday', 'Rest or 30 min very easy'],
      ['Saturday', '50 min easy run'],
      ['Sunday', '28 km long run with 10 km at marathon pace'],
    ],
  },

  {
    slug: 'trail', esSlug: 'trail',
    distance: 'Trail',
    title: 'Adaptive Trail Running Plan (8-16 Weeks) — Ends on Race Day | CorrerJuntos',
    desc: 'A trail running plan that fits your race date. 8 to 16 weeks based on your calendar, last week tapered. Hills, technical descents, strength. Free download.',
    ogTitle: 'Adaptive Trail Running Plan — Ends on Race Day | CorrerJuntos',
    ogDesc: 'A trail plan that fits your race date. 8 to 16 weeks, last week tapered.',
    breadcrumb: 'Trail Plan',
    h1: 'A Trail plan that ends<br>on your <em style="font-style:normal;color:#f97316">race day</em>',
    sub: 'Set your race date. We generate a plan of <strong>8 to 16 weeks</strong> that ends exactly on race day &mdash; with the last week tapered. Hills, downhill technique and long mountain runs.',
    weeksRange: '8-16',
    sessionsPerWeek: '4',
    minWeeks: 8,
    canonicalWeeks: 10,
    audience: 'Road runners moving to trail or trail beginners',
    audienceLines: [
      '<li><strong>Some running base:</strong> you can run 6-8 km on the road comfortably</li>',
      '<li><strong>You want a first trail race:</strong> 10-25 km mountain race, technical or rolling</li>',
      '<li><strong>4 sessions per week:</strong> mixing road, trail, hills and strength</li>',
      '<li><strong>Access to trails or hills:</strong> at least one terrain session per week</li>',
    ],
    phases: [
      ['Base &amp; hills', '1-3', 'Easy runs + 1 hill day per week. Build aerobic base and leg strength.'],
      ['Technical', '4-6', 'Trail-specific sessions. Downhill technique drills. Long trail runs.'],
      ['Specific', '7-9', 'Race-simulation runs on similar terrain. Long efforts of 2+ hours.'],
      ['Taper', '10 (last)', 'Volume reduction. Short trail runs. Race fueling practice.'],
    ],
    weekTitle: 'Sample week (week 6)',
    weekDays: [
      ['Monday', 'Rest'],
      ['Tuesday', '40 min easy road + leg strength (squats, lunges, calves)'],
      ['Wednesday', 'Rest or core/mobility'],
      ['Thursday', 'Hill repeats: 8x90s uphill / jog down'],
      ['Friday', 'Rest'],
      ['Saturday', '30 min easy on flat'],
      ['Sunday', '90 min long trail run with technical descent practice'],
    ],
  },
];

const tpl = fs.readFileSync(SRC, 'utf8');

function buildVariant(v) {
  let h = tpl;

  // 1. Title + meta description
  h = h.replace(
    /<title>Adaptive 10K Plan \(6-18 Weeks\) — Ends on Race Day \| CorrerJuntos<\/title>/,
    `<title>${v.title}</title>`
  );
  h = h.replace(
    /<meta name="description" content="A 10K plan that fits your race date\. 6 to 18 weeks based on your calendar, last week tapered\. Intervals, tempo and long runs\. Free download\.">/,
    `<meta name="description" content="${v.desc}">`
  );

  // 2. Canonical + hreflang + alternate URLs
  h = h.replace(/\/planes\/en\/10k/g, `/planes/en/${v.slug}`);
  h = h.replace(/\/planes\/10k(?![a-z0-9-])/g, `/planes/${v.esSlug}`);

  // 3. OG title + description
  h = h.replace(
    /<meta property="og:title" content="Adaptive 10K Plan — Ends on Race Day \| CorrerJuntos">/,
    `<meta property="og:title" content="${v.ogTitle}">`
  );
  h = h.replace(
    /<meta property="og:description" content="A 10K plan that fits your race date\. 6 to 18 weeks based on your calendar, last week tapered\.">/,
    `<meta property="og:description" content="${v.ogDesc}">`
  );

  // 4. Schema.org WebPage name+description (basic update)
  h = h.replace(
    /"name": "Adaptive 10K Plan \(6-18 Weeks\) — Ends on Race Day \| CorrerJuntos"/,
    `"name": "${v.title}"`
  );
  h = h.replace(
    /"description": "A 10K plan that fits your race date\. 6 to 18 weeks, last week tapered\."/,
    `"description": "${v.desc}"`
  );

  // 5. Breadcrumb + listitem
  h = h.replace(/"name": "10K Plan"/, `"name": "${v.breadcrumb}"`);
  h = h.replace(/<span>10K Plan<\/span>/, `<span>${v.breadcrumb}</span>`);
  // The breadcrumb in HTML is plain "10K Plan" without span sometimes — redo via string match
  h = h.replace(/(?<=<span>\/<\/span>)10K Plan/, v.breadcrumb);

  // 6. Hero badge + h1 + subtitle
  h = h.replace(
    /<h1>A 10K plan that ends<br>on your <em style="font-style:normal;color:#f97316">race day<\/em><\/h1>/,
    `<h1>${v.h1}</h1>`
  );
  h = h.replace(
    /<p class="subtitle">Set your race date\. We generate a plan of <strong>6 to 18 weeks<\/strong> that ends exactly on race day &mdash; with the last week tapered\. No gaps\. No improvising\.<\/p>/,
    `<p class="subtitle">${v.sub}</p>`
  );

  // For 0-5K mark badge as Free instead of New
  if (v.isFree) {
    h = h.replace(/Adaptive &middot; New/, 'Adaptive &middot; Free');
  }

  // 7. Stats numbers
  h = h.replace(
    /<div class="plan-stat"><div class="plan-stat-number">6-18<\/div><div class="plan-stat-label">Adaptive weeks<\/div><\/div>\s*<div class="plan-stat"><div class="plan-stat-number">4&times;<\/div><div class="plan-stat-label">Sessions \/ week<\/div><\/div>\s*<div class="plan-stat"><div class="plan-stat-number">&middot;<\/div><div class="plan-stat-label">Ends on race day<\/div><\/div>/,
    v.isFree
      ? `<div class="plan-stat"><div class="plan-stat-number">${v.weeksRange}</div><div class="plan-stat-label">Adaptive weeks</div></div>\n    <div class="plan-stat"><div class="plan-stat-number">${v.sessionsPerWeek}&times;</div><div class="plan-stat-label">Sessions / week</div></div>\n    <div class="plan-stat"><div class="plan-stat-number" style="font-size:1.4rem">FREE</div><div class="plan-stat-label">Forever</div></div>`
      : `<div class="plan-stat"><div class="plan-stat-number">${v.weeksRange}</div><div class="plan-stat-label">Adaptive weeks</div></div>\n    <div class="plan-stat"><div class="plan-stat-number">${v.sessionsPerWeek}&times;</div><div class="plan-stat-label">Sessions / week</div></div>\n    <div class="plan-stat"><div class="plan-stat-number">&middot;</div><div class="plan-stat-label">Ends on race day</div></div>`
  );

  // 8. "Who is this plan for" section content
  h = h.replace(
    /<ul>\s*<li><strong>Intermediate runner:[\s\S]*?<\/li>\s*<\/ul>/,
    `<ul>\n    ${v.audienceLines.join('\n    ')}\n  </ul>`
  );

  // 9. Phases table
  const phaseRows = v.phases.map(([ph, wk, ct]) =>
    `      <tr><td>${ph}</td><td>${wk}</td><td>${ct}</td></tr>`
  ).join('\n');
  h = h.replace(
    /<tbody>\s*<tr><td>Base<\/td>[\s\S]*?<\/tbody>/,
    `<tbody>\n${phaseRows}\n    </tbody>`
  );

  // 10. Sample week
  h = h.replace(
    /<h2>Sample week \(week 7\)<\/h2>/,
    `<h2>${v.weekTitle}</h2>`
  );
  const dayRows = v.weekDays.map(([d, a]) =>
    `    <div class="week-day"><span class="day">${d}</span><span class="activity">${a}</span></div>`
  ).join('\n');
  h = h.replace(
    /<div class="week-example">[\s\S]*?<\/div>\s*<\/div>(?=\s*<div class="section">\s*<h2>Why train)/,
    `<div class="week-example">\n${dayRows}\n  </div>\n</div>`
  );

  // 11. Why train h4 references to 10K
  h = h.replace(
    /Join training meetups and 10K races happening in your city/,
    `Join training meetups and ${v.distance} runs happening in your city`
  );

  // 12. CTA box copy
  h = h.replace(
    /Your 10K plan is waiting inside the app/,
    `Your ${v.distance} plan is waiting inside the app`
  );
  h = h.replace(
    /Improve your 10K time with a proven adaptive plan/,
    `Train smart for your ${v.distance} with an adaptive plan that ends on your race day`
  );

  // 13. FAQ — only the first question references 10K
  h = h.replace(
    /How much can I improve my 10K time\?/g,
    v.slug === '0-5k'
      ? 'How does the couch-to-5K progression work?'
      : `How much can I improve my ${v.distance} time?`
  );
  h = h.replace(
    /With a structured plan, most intermediate runners improve their 10K personal best by 2 to 5 minutes\. Improvement depends on your starting fitness, consistency, and adherence(\.|, and adherence\.)/g,
    v.slug === '0-5k'
      ? 'The plan starts with walk/run intervals and gradually shifts toward continuous running. By week 6-8 most beginners can run a continuous 5K. The exact progression scales to the weeks you have until your goal date.'
      : `With a structured plan, most runners improve their ${v.distance} time meaningfully. The exact gain depends on your starting fitness, consistency, and adherence to the plan.`
  );
  h = h.replace(
    /\(under 6 weeks for a 10K\)/g,
    `(under ${v.minWeeks} weeks for a ${v.distance})`
  );
  h = h.replace(
    /go to Training Plans to activate the 10K plan/g,
    `go to Training Plans to activate the ${v.distance} plan`
  );

  return h;
}

for (const v of variants) {
  const dir = path.join(ROOT, 'planes', 'en', v.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(out, buildVariant(v));
  console.log(`✓ /planes/en/${v.slug}/index.html`);
}
