using Interation.iRepeater.IOC;
using Interation.iRepeater.Service.IServiceProvider;
using Interation.iRepeater.Web.Controllers;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Interation.iRepeater.Testing.IntegrationTest.Controllers
{
    [TestClass]
    public class AppControllerTest
    {
        AppController appController;
        IProductService _productService;
        ITopicService _topicService;

        [TestInitialize]
        public void Setup()
        {
            _productService = InjectionRepository.Get<IProductService>();
            _topicService = InjectionRepository.Get<ITopicService>();
            appController = new AppController(_productService, _topicService);
        }

        [TestMethod]
        public void Get()
        {
            appController.Get("v1.0", "abc");
        }
    }
}
