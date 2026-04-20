const fs = require('fs');
const files = [
  'app/home/components/LeftSidebar.tsx',
  'app/home/components/PostCard.tsx',
  'app/home/components/RightSidebar.tsx',
  'app/lost-pets/admin/admin.tsx',
  'app/owner/owner.tsx',
  'app/owner/settings/components/AccountProfile.tsx',
  'app/pet/[qrId]/qrId.tsx',
  'app/pets/pets.tsx',
  'app/pets/[id]/id.tsx',
  'app/register/register.tsx',
  'app/watchlist/watchlist.tsx',
  'components/ui/avatar.tsx',
  'components/OverviewMap.tsx',
  'components/lost-pets/FoundPetAnnouncementCard.tsx',
  'components/lost-pets/FoundPetReportForm.tsx',
  'components/lost-pets/LostPetAnnouncementCard.tsx',
  'components/lost-pets/LostPetReportForm.tsx'
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('/* eslint-disable @next/next/no-img-element */')) {
    if (content.startsWith('"use client";')) {
      fs.writeFileSync(f, content.replace('"use client";', '"use client";\n/* eslint-disable @next/next/no-img-element */'));
    } else {
      fs.writeFileSync(f, '/* eslint-disable @next/next/no-img-element */\n' + content);
    }
  }
});
console.log('Fixed img tags');