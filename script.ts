import{ placeBetBySlug} from './lib/api'; // Replace with the actual path to your library
const slug = 'will-an-ai-get-gold-on-any-internat' ;
const outcome = "NO"
const result = placeBetBySlug(process.env.NEXT_PUBLIC_MANIFOLD_API_KEY, slug, 100, outcome); // Replace with the actual function you want to call
console.log('Result:', result);