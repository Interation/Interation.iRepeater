using Interation.iRepeater.Repository.IRepositoryProvider;
using Interation.iRepeater.Repository.RepositoryImplementation;
using Ninject.Modules;

namespace Interation.iRepeater.IOC.BindingModules
{
    public class RepositoryBindingModule : NinjectModule
    {
        public override void Load()
        {
            Bind<IProductRepository>().To<ProductRepository>().InSingletonScope();
            Bind<ITopicRepository>().To<TopicRepository>().InSingletonScope();
        }
    }
}
