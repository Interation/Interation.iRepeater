using Interation.iRepeater.Service.IServiceProvider;
using Interation.iRepeater.Service.ServiceImplementation;
using Ninject.Modules;

namespace Interation.iRepeater.IOC.BindingModules
{
    public class ServiceBindingModule : NinjectModule
    {
        public override void Load()
        {
            Bind<IProductService>().To<ProductService>().InSingletonScope();
            Bind<ITopicService>().To<TopicService>().InSingletonScope();
        }
    }
}
