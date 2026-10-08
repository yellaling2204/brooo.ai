import { AIAnalysisRequest, AIAnalysisResponse, AIEmbeddingRequest, AIProvider } from './provider.interface';

export class MockAIProvider implements AIProvider {
  public name = 'mock';

  async analyze<T = any>(request: AIAnalysisRequest): Promise<AIAnalysisResponse<T>> {
    const prompt = (request.userPrompt || '').toLowerCase();
    
    // Case 5: Phishing / Scam detection
    if (prompt.includes('scam') || prompt.includes('lottery') || prompt.includes('05-scam') || prompt.includes('prize') || prompt.includes('5,000,000')) {
      const scamData = {
        category: 'scam_risk',
        overall_summary: "⚠️ Heads up brooo! This is an active lottery scam. Do NOT wire any money or click the link.",
        is_suspicious: true,
        suspicion_reasons: [
          'Unsolicited notification claiming a $5,000,000 cash lottery win',
          'Demands an upfront $250 wire fee to release fake prize money',
          'Requests sensitive personal banking credentials and PIN',
          'Employs manipulative artificial urgency (60-minute countdown timer)',
          'Directs user to an unverified, masked shortlink (bit.ly)',
        ],
        actions: [
          {
            type: 'warning',
            title: 'ALERT: Block & Report Lottery Scam',
            summary: 'High risk phishing scam detected. Do not click links, wire $250 fee, or share bank account PIN.',
            priority: 'urgent',
            confidence: 0.99,
            requires_confirmation: false,
            entities: {
              scam_type: 'Advance-fee lottery fraud',
              risk_level: 'Critical',
              demanded_fee: '$250',
              claimed_prize: '$5,000,000',
              suspicious_url: 'http://bit.ly/claim-mega-cash-now',
            },
          },
        ],
        memories_to_store: [
          {
            category: 'general',
            key: 'flagged_scam_contact',
            value: 'Flagged advance-fee lottery scam claiming $5,000,000 prize from Global Mega Cash.',
            confidence: 0.99,
          },
        ],
      };
      return this.wrapResponse(scamData);
    }

    // Case 4: Utility / Bill Payment
    if (prompt.includes('bill') || prompt.includes('utility') || prompt.includes('04-bill') || prompt.includes('apex power') || prompt.includes('124.50')) {
      const billData = {
        category: 'bills',
        overall_summary: "Got your bill brooo! Apex Power electric bill for $124.50 is due on October 25, 2026.",
        is_suspicious: false,
        suspicion_reasons: [],
        actions: [
          {
            type: 'payment',
            title: 'Pay Apex Power Electricity Bill',
            summary: 'Pay $124.50 for account 884-291-039 before October 25, 2026 to avoid a $15 late fee.',
            priority: 'high',
            date: '2026-10-25',
            time: '17:00',
            confidence: 0.97,
            requires_confirmation: true,
            entities: {
              biller: 'Apex Power & Electricity',
              account_number: '884-291-039',
              amount_due: '$124.50',
              statement_date: '2026-10-05',
              payment_portal: 'apexpower.com/pay',
              late_penalty: '$15.00',
            },
          },
        ],
        memories_to_store: [
          {
            category: 'documents',
            key: 'apex_power_account',
            value: 'Apex Power electricity account 884-291-039. Monthly bill ~$124.50.',
            confidence: 0.96,
          },
        ],
      };
      return this.wrapResponse(billData);
    }

    // Case 3: Insurance Renewal
    if (prompt.includes('insurance') || prompt.includes('safeguard') || prompt.includes('03-insurance') || prompt.includes('pol-77492')) {
      const insuranceData = {
        category: 'insurance',
        overall_summary: "Brooo spotted your car insurance renewal! SafeGuard policy POL-77492-V expires November 15, 2026.",
        is_suspicious: false,
        suspicion_reasons: [],
        actions: [
          {
            type: 'renewal',
            title: 'Renew SafeGuard Auto Insurance Policy',
            summary: 'Vehicle insurance for 2022 Honda Civic expires on November 15, 2026. Renew to avoid policy lapse.',
            priority: 'high',
            date: '2026-11-15',
            time: '23:59',
            confidence: 0.98,
            requires_confirmation: true,
            entities: {
              provider: 'SafeGuard Auto Insurance',
              policy_number: 'POL-77492-V',
              vehicle: '2022 Honda Civic',
              expiration_date: '2026-11-15',
              policyholder: 'John Doe',
            },
          },
        ],
        memories_to_store: [
          {
            category: 'documents',
            key: 'auto_insurance_policy',
            value: 'SafeGuard Auto Insurance policy POL-77492-V for 2022 Honda Civic expires November 15, 2026.',
            confidence: 0.98,
          },
        ],
      };
      return this.wrapResponse(insuranceData);
    }

    // Case 2: Job Description
    if (prompt.includes('job') || prompt.includes('career opportunity') || prompt.includes('acme corp') || prompt.includes('02-job') || prompt.includes('backend engineer')) {
      const jobData = {
        category: 'career',
        overall_summary: "Found an open role brooo! Senior Backend Engineer at Acme Corp ($140k-$160k). Deadline is October 20.",
        is_suspicious: false,
        suspicion_reasons: [],
        actions: [
          {
            type: 'application',
            title: 'Apply for Senior Backend Engineer at Acme Corp',
            summary: 'Submit resume and portfolio for Senior Backend Engineer position before deadline on October 20, 2026.',
            priority: 'medium',
            date: '2026-10-20',
            time: '18:00',
            confidence: 0.95,
            requires_confirmation: false,
            entities: {
              company: 'Acme Corp',
              role: 'Senior Backend Engineer',
              location: 'Remote / Bengaluru',
              salary: '$140,000 - $160,000 / year',
              skills: ['TypeScript', 'Node.js', 'Distributed Systems', 'PostgreSQL'],
              application_email: 'careers@acmecorp.io',
              deadline: '2026-10-20',
            },
          },
        ],
        memories_to_store: [
          {
            category: 'career',
            key: 'target_role_acme',
            value: 'Interested in Senior Backend Engineer at Acme Corp ($140k-$160k, TypeScript/Node.js).',
            confidence: 0.95,
          },
        ],
      };
      return this.wrapResponse(jobData);
    }

    // Default / Case 1: Interview (01-interview)
    const interviewData = {
      category: 'career',
      overall_summary: "Brooo found your interview! Software Engineering round with ABC Technologies on Monday at 11 AM.",
      is_suspicious: false,
      suspicion_reasons: [],
      actions: [
        {
          type: 'appointment',
          title: 'Prepare for ABC Technologies interview',
          summary: 'Prepare SQL and System Design concepts before your technical interview on Monday, October 12 at 11:00 AM IST.',
          priority: 'high',
          date: '2026-10-12',
          time: '11:00',
          confidence: 0.98,
          requires_confirmation: false,
          entities: {
            company: 'ABC Technologies',
            role: 'Software Engineer',
            requirements: ['SQL', 'System Design'],
            meeting_url: 'https://meet.abc-tech.com/interview-8821',
            date_display: 'October 12, 2026',
            time_display: '11:00 AM IST',
          },
        },
      ],
      memories_to_store: [
        {
          category: 'career',
          key: 'upcoming_interview',
          value: 'Software engineering interview with ABC Technologies scheduled for Monday, October 12, 2026 at 11:00 AM IST. Prepare SQL and System Design.',
          confidence: 0.98,
        },
      ],
    };

    return this.wrapResponse(interviewData);
  }

  private wrapResponse<T>(data: any): AIAnalysisResponse<T> {
    return {
      data: data as T,
      rawText: JSON.stringify(data),
      modelUsed: 'mock-vision-v0.1',
      tokenUsage: {
        promptTokens: 150,
        completionTokens: 90,
        totalTokens: 240,
      },
    };
  }

  async generateEmbeddings(request: AIEmbeddingRequest): Promise<number[][]> {
    return request.texts.map(() => new Array(1536).fill(0.01));
  }
}
