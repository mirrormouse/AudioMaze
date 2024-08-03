import Link from 'next/link';

const stages = [
    { id: 1, name: 'ステージ1', description: '電子音源を探し出そう' },
    { id: 2, name: 'ステージ2', description: '犬の鳴き声はどこから聞こえる？' },
    { id: 3, name: 'ステージ3', description: '水滴はどこで垂れている？' },
    // 必要に応じてステージを追加
];

export default function MainPage() {
    return (
        <div className="min-h-screen bg-cream-100 p-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Audio Maze</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stages.map((stage) => (
                    <Link href={`/stage/${stage.id}`} key={stage.id}>
                        <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105">
                            <h2 className="text-2xl font-semibold text-gray-700">{stage.name}</h2>
                            <p className="text-gray-600 mt-2">{stage.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}