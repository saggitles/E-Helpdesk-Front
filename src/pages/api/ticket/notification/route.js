export async function POST(req,res){
    const { email } = await req.json();
    console.log(email)
}