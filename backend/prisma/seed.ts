// prisma/seed.ts
import { PrismaClient, UserType, CompanySize, ProficiencyLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // limpar tabelas
    await prisma.payment.deleteMany()
    await prisma.review.deleteMany()
    await prisma.mentoringSession.deleteMany()
    await prisma.programParticipant.deleteMany()
    await prisma.mentorshipProgram.deleteMany()
    await prisma.mentorSkill.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.mentor.deleteMany()
    await prisma.company.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await bcrypt.hash('123456', 10)

    // cria empresa
    const companyUser = await prisma.user.create({
        data: {
            name: 'TechCorp Ltda',
            email: 'contact@techcorp.com',
            passwordHash,
            userType: UserType.COMPANY,
        },
    })

    const company = await prisma.company.create({
        data: {
            userId: companyUser.id,
            companyName: 'TechCorp',
            cnpj: '12345678000199',
            industry: 'Software',
            companySize: CompanySize.MEDIUM,
            website: 'https://techcorp.com',
            description: 'Empresa de tecnologia que precisa treinar sua equipe.',
        },
    })

    // cria mentores
    const mentorUser1 = await prisma.user.create({
        data: {
            name: 'Alice Mentor',
            email: 'alice@mentor.com',
            passwordHash,
            userType: UserType.MENTOR,
        },
    })

    const mentor1 = await prisma.mentor.create({
        data: {
            userId: mentorUser1.id,
            title: 'Senior Fullstack Developer',
            bio: '10+ anos de experiência em desenvolvimento web.',
            yearsExperience: 10,
            hourlyRate: 200,
            linkedinUrl: 'https://linkedin.com/in/alice',
            githubUrl: 'https://github.com/alice',
            portfolioUrl: 'https://alice.dev',
            seniority: 'SENIOR',
            isApproved: true,
        },
    })

    const mentorUser2 = await prisma.user.create({
        data: {
            name: 'Bob Mentor',
            email: 'bob@mentor.com',
            passwordHash,
            userType: UserType.MENTOR,
        },
    })

    const mentor2 = await prisma.mentor.create({
        data: {
            userId: mentorUser2.id,
            title: 'Cloud Architect',
            bio: 'Especialista em DevOps e Cloud.',
            yearsExperience: 8,
            hourlyRate: 180,
            linkedinUrl: 'https://linkedin.com/in/bob',
            seniority: 'PLENO',
            isApproved: true,
        },
    })

    // cria skills
    const jsSkill = await prisma.skill.create({
        data: { name: 'JavaScript', category: 'Frontend' },
    })
    const reactSkill = await prisma.skill.create({
        data: { name: 'React', category: 'Frontend' },
    })
    const devopsSkill = await prisma.skill.create({
        data: { name: 'DevOps', category: 'Cloud' },
    })

    // vincula skills aos mentores
    await prisma.mentorSkill.createMany({
        data: [
            {
                mentorId: mentor1.id,
                skillId: jsSkill.id,
                proficiencyLevel: ProficiencyLevel.EXPERT,
                yearsExperience: 10,
            },
            {
                mentorId: mentor1.id,
                skillId: reactSkill.id,
                proficiencyLevel: ProficiencyLevel.EXPERT,
                yearsExperience: 8,
            },
            {
                mentorId: mentor2.id,
                skillId: devopsSkill.id,
                proficiencyLevel: ProficiencyLevel.EXPERT,
                yearsExperience: 8,
            },
        ],
    })

    // cria programa de mentoria
    const program = await prisma.mentorshipProgram.create({
        data: {
            companyId: company.id,
            mentorId: mentor1.id,
            title: 'Capacitação em React',
            description: 'Treinamento intensivo de 4 semanas em React moderno.',
            skillFocus: 'React',
            durationWeeks: 4,
            totalHours: 40,
            priceTotal: 5000,
        },
    })

    // adiciona participantes
    await prisma.programParticipant.createMany({
        data: [
            {
                programId: program.id,
                participantName: 'Carlos Silva',
                participantEmail: 'carlos@techcorp.com',
                currentLevel: 'Júnior',
                goals: 'Aprender React para projetos internos.',
            },
            {
                programId: program.id,
                participantName: 'Fernanda Souza',
                participantEmail: 'fernanda@techcorp.com',
                currentLevel: 'Pleno',
                goals: 'Aprimorar conhecimentos de React Hooks.',
            },
        ],
    })

    console.log('✅ Seed finalizado com sucesso!')
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })
