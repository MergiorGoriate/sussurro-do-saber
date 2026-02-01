import React from 'react';

const TermsOfUse: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-blue mb-8 border-b pb-4">Termos de Uso</h1>
        
        <div className="prose prose-lg prose-blue max-w-none text-gray-700 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Termos</h2>
          <p>
            Ao acessar ao site <strong>Sussurros do Saber</strong>, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Uso de Licença</h2>
          <p>
            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Sussurros do Saber , apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>modificar ou copiar os materiais;</li>
            <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
            <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Sussurros do Saber;</li>
            <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
            <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
          </ol>
          <p>
            Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por Sussurros do Saber a qualquer momento.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Isenção de responsabilidade</h2>
          <p>
            Os materiais no site da Sussurros do Saber são fornecidos 'como estão'. Sussurros do Saber não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Limitações</h2>
          <p>
            Em nenhum caso o Sussurros do Saber ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Sussurros do Saber, mesmo que Sussurros do Saber ou um representante autorizado da Sussurros do Saber tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Precisão dos materiais</h2>
          <p>
            Os materiais exibidos no site da Sussurros do Saber podem incluir erros técnicos, tipográficos ou fotográficos. Sussurros do Saber não garante que qualquer material em seu site seja preciso, completo ou atual. Sussurros do Saber pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Links</h2>
          <p>
            O Sussurros do Saber não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por Sussurros do Saber do site. O uso de qualquer site vinculado é por conta e risco do usuário.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Modificações</h2>
          <p>
            O Sussurros do Saber pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
