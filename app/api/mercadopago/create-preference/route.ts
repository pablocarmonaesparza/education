import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { title, unit_price, quantity = 1 } = await req.json();

    const preference = new Preference(client); // Use the instantiated client
    const response = await preference.create({
      body: { // Preference body
        items: [
          {
            id: title, // Added id property
            title,
            unit_price,
            quantity,
          },
        ],
        back_urls: {
          success: `${req.nextUrl.origin}/success-mercadopago`,
          failure: `${req.nextUrl.origin}/cancel-mercadopago`,
          pending: `${req.nextUrl.origin}/pending-mercadopago`,
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ initPoint: response.init_point }); // Access init_point correctly
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
