import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-blue mb-8 border-b pb-4">Política de Privacidade</h1>
        
        <div className="prose prose-lg prose-blue max-w-none text-gray-700 space-y-6">
          <p className="lead text-xl">
            A sua privacidade é importante para nós. É política do <strong>Sussurros do Saber</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site <a href="/">Sussurros do Saber</a>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Informações que coletamos</h2>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Uso de Informações</h2>
          <p>
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Compartilhamento de Dados</h2>
          <p>
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Cookies</h2>
          <p>
            O nosso site usa cookies para melhorar a experiência do utilizador. Ao continuar a navegar, você concorda com o uso de cookies necessários para o funcionamento da plataforma.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Compromisso do Usuário</h2>
          <p>
            O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o Sussurros do Saber oferece no site e com caráter enunciativo, mas não limitativo:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
            <li>Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
            <li>Não causar danos aos sistemas físicos (hardware) e lógicos (software) do Sussurros do Saber, de seus fornecedores ou terceiros.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Mais informações</h2>
          <p>
            Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
          </p>
          <p className="mt-8 text-sm text-gray-500">
            Esta política é efetiva a partir de <strong>Outubro/2024</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
