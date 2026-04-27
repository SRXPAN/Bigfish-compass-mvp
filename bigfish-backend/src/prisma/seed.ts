// src/prisma/seed.ts
/**
 * Prisma Seed Script
 * Populates the database with sample Assessment data for testing
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // ============================================
    // TASK 1: Create a Test User with Tokens
    // ============================================
    console.log('📝 Creating test student user...')
    
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const testUser = await prisma.user.upsert({
      where: { email: 'student@bigfish.com' },
      update: {
        tokens: 10,
        seatsAvailable: 0,
      },
      create: {
        email: 'student@bigfish.com',
        name: 'Test Student',
        password: hashedPassword,
        role: 'STUDENT',
        tokens: 10,
        seatsAvailable: 0,
        emailVerified: true,
        isPremium: true,
      },
    })
    
    console.log(`✅ Test user created/updated: ${testUser.email} (ID: ${testUser.id})`)
    console.log(`   Tokens: ${testUser.tokens}`)

    // ============================================
    // TASK 2: Create an Assessment Template
    // ============================================
    console.log('\n📋 Creating Assessment Template...')
    
    // Find or create the template
    let assessmentTemplate = await prisma.assessmentTemplate.findFirst({
      where: { name: 'Tech Career Discoverer' },
    })
    
    if (!assessmentTemplate) {
      assessmentTemplate = await prisma.assessmentTemplate.create({
        data: {
          name: 'Tech Career Discoverer',
          nameJson: {
            EN: 'Tech Career Discoverer',
            UA: 'Дослідник кар\'єри в технологіях',
            PL: 'Odkrywca kariery technologicznej',
          },
          description: 'Discover which tech career path matches your skills and interests',
          descriptionJson: {
            EN: 'Discover which tech career path matches your skills and interests',
            UA: 'Знайдіть, яка кар\'єра в технологіях вам підходить',
            PL: 'Odkryj, która ścieżka kariery technologicznej do ciebie pasuje',
          },
          locale: 'EN',
          durationMinutes: 15,
          isActive: true,
        },
      })
    } else {
      // Update if exists
      assessmentTemplate = await prisma.assessmentTemplate.update({
        where: { id: assessmentTemplate.id },
        data: {
          isActive: true,
          durationMinutes: 15,
        },
      })
    }
    
    console.log(`✅ Assessment Template created/updated: ${assessmentTemplate.name} (ID: ${assessmentTemplate.id})`)

    // ============================================
    // TASK 3: Add Weighted Questions
    // ============================================
    console.log('\n🎯 Creating Assessment Questions with weighted options...')

    // Delete existing questions for this template (for idempotency)
    await prisma.assessmentQuestion.deleteMany({
      where: { templateId: assessmentTemplate.id },
    })

    // Question 1: Problem-Solving Preference
    const question1 = await prisma.assessmentQuestion.create({
      data: {
        templateId: assessmentTemplate.id,
        text: 'When faced with a challenging problem, I prefer to:',
        textJson: {
          EN: 'When faced with a challenging problem, I prefer to:',
          UA: 'Коли я стикаюся зі складною проблемою, я віддаю перевагу:',
          PL: 'Gdy stanę przed trudnym problemem, wolę:',
        },
        order: 1,
        type: 'SINGLE_CHOICE',
        options: [
          {
            id: 'q1_opt1',
            label: {
              EN: 'Solve complex math puzzles and algorithms',
              UA: 'Вирішувати складні математичні задачі та алгоритми',
              PL: 'Rozwiązywać złożone zagadki matematyczne i algorytmy',
            },
            dimensionWeights: {
              'Analytical': 5,
              'Problem-Solving': 4,
              'Logical Thinking': 5,
            },
          },
          {
            id: 'q1_opt2',
            label: {
              EN: 'Design innovative solutions and think outside the box',
              UA: 'Проектувати інноваційні рішення та мислити нестандартно',
              PL: 'Projektować innowacyjne rozwiązania i myśleć niestandardowo',
            },
            dimensionWeights: {
              'Creative': 5,
              'Innovation': 5,
              'Problem-Solving': 3,
            },
          },
          {
            id: 'q1_opt3',
            label: {
              EN: 'Lead a team to brainstorm and collaborate',
              UA: 'Очолити команду для мозкового штурму та співпраці',
              PL: 'Kierować zespołem do burzy mózgów i współpracy',
            },
            dimensionWeights: {
              'Leadership': 5,
              'Communication': 4,
              'Teamwork': 4,
            },
          },
        ],
      },
    })
    
    console.log(`✅ Question 1 created: "${question1.text}" (ID: ${question1.id})`)

    // Question 2: Work Environment Preference
    const question2 = await prisma.assessmentQuestion.create({
      data: {
        templateId: assessmentTemplate.id,
        text: 'In your ideal work environment, you would:',
        textJson: {
          EN: 'In your ideal work environment, you would:',
          UA: 'У вашому ідеальному робочому середовищі ви б:',
          PL: 'W Twoim idealnym środowisku pracy byś:',
        },
        order: 2,
        type: 'SINGLE_CHOICE',
        options: [
          {
            id: 'q2_opt1',
            label: {
              EN: 'Work with databases and manage complex data',
              UA: 'Працювати з базами даних та керувати складними даними',
              PL: 'Pracować z bazami danych i zarządzać złożonymi danymi',
            },
            dimensionWeights: {
              'Analytical': 4,
              'Attention to Detail': 5,
              'Logical Thinking': 4,
            },
          },
          {
            id: 'q2_opt2',
            label: {
              EN: 'Create visually stunning and user-friendly interfaces',
              UA: 'Створювати візуально вражаючі та зручні інтерфейси',
              PL: 'Tworzyć wizualnie oszałamiające i przyjazne interfejsy użytkownika',
            },
            dimensionWeights: {
              'Creative': 5,
              'Design Sense': 5,
              'Attention to Detail': 3,
            },
          },
          {
            id: 'q2_opt3',
            label: {
              EN: 'Build infrastructure and ensure system reliability',
              UA: 'Будувати інфраструктуру та забезпечувати надійність системи',
              PL: 'Budować infrastrukturę i zapewniać niezawodność systemu',
            },
            dimensionWeights: {
              'Analytical': 4,
              'Problem-Solving': 4,
              'Reliability': 5,
            },
          },
        ],
      },
    })
    
    console.log(`✅ Question 2 created: "${question2.text}" (ID: ${question2.id})`)

    // Question 3: Collaboration Style
    const question3 = await prisma.assessmentQuestion.create({
      data: {
        templateId: assessmentTemplate.id,
        text: 'How do you prefer to develop your skills?',
        textJson: {
          EN: 'How do you prefer to develop your skills?',
          UA: 'Як ви надаєте перевагу розвивати свої навички?',
          PL: 'Jak wolisz rozwijać swoje umiejętności?',
        },
        order: 3,
        type: 'SINGLE_CHOICE',
        options: [
          {
            id: 'q3_opt1',
            label: {
              EN: 'Through continuous learning and research',
              UA: 'Через постійне навчання та дослідження',
              PL: 'Poprzez ciągłe uczenie się i badania',
            },
            dimensionWeights: {
              'Learning Orientation': 5,
              'Analytical': 3,
              'Curiosity': 5,
            },
          },
          {
            id: 'q3_opt2',
            label: {
              EN: 'By mentoring others and sharing knowledge',
              UA: 'Наставляючи інших та діляться знаннями',
              PL: 'Poprzez mentorowanie innych i dzielenie się wiedzą',
            },
            dimensionWeights: {
              'Leadership': 4,
              'Communication': 5,
              'Empathy': 4,
            },
          },
          {
            id: 'q3_opt3',
            label: {
              EN: 'Through hands-on projects and experimentation',
              UA: 'Через практичні проекти та експерименти',
              PL: 'Poprzez praktyczne projekty i eksperymenty',
            },
            dimensionWeights: {
              'Creative': 4,
              'Problem-Solving': 4,
              'Innovation': 4,
            },
          },
        ],
      },
    })
    
    console.log(`✅ Question 3 created: "${question3.text}" (ID: ${question3.id})`)

    console.log('\n✨ Database seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • Test User: student@bigfish.com (password: password123)`)
    console.log(`   • Assessment Template: ${assessmentTemplate.name}`)
    console.log(`   • Questions: ${[question1, question2, question3].length}`)
    console.log(`   • Dimensions tracked: Analytical, Problem-Solving, Creative, Leadership, etc.`)
    console.log('\n🚀 Ready to test the Assessment APIs!')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('Fatal error during seed:', e)
    process.exit(1)
  })
