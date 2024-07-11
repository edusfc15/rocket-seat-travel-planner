import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                start_at: z.coerce.date(),
                end_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email())
            })
        },
    }, async (request) => {
        const { destination, start_at, end_at, owner_name, owner_email, emails_to_invite } = request.body;

        if (dayjs(start_at).isBefore(new Date())) {
            throw new ClientError('Start date must be in the future');
        }

        if (dayjs(end_at).isBefore(dayjs(start_at))) {
            throw new ClientError('End date must be after start date');
        }

        const trip = await prisma.trip.create({
            data: {
                destination,
                start_at,
                end_at,
                participants: {
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                is_confirmed: true,
                                is_owner: true
                            },
                            ...emails_to_invite.map(email => ({
                                email,
                            }))
                        ]
                    }
                }
            }
        });

        const formattedStartAt = dayjs(start_at).format('LL');
        const formattedEndAt = dayjs(end_at).format('LL');

        const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;

        const mail = await getMailClient();

        const message = await mail.sendMail({
            from: {
                name: 'Trip Planner',
                address: 'oi@plann.er'
            }, to: {
                name: owner_name,
                address: owner_email
            },
            subject: `Confirme sua viagem para ${destination} em ${formattedStartAt} `,
            html: `
            <div style="font-family: sans-serif;font-size: 16px; line-height: 1.6;">
                <p>
                    Você solicitou a criação de uma viagem  para <strong>${destination}</strong> nas datas de <strong>${formattedStartAt}</strong> até <strong>${formattedEndAt}</strong> .
                </p>
                <p></p>
                <p>
                    Para confirmar a viagem, clique no link abaixo:
                </p>
                <p></p>
                <p>
                    <a href="${confirmationLink}">Clique aqui para confirmar a viagem</a>
                </p>
                <p></p>
                <p>Caso você não saiba do que se trata esse email, apenas ignore</p>
            </div>
            `
                .trim()
        });

        console.log(nodemailer.getTestMessageUrl(message));


        return {
            tripId: trip.id
        }
    })
}