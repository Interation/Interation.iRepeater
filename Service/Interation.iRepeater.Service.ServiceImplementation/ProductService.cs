using System.Collections.Generic;
using Interation.iRepeater.Repository.Entity;
using Interation.iRepeater.Repository.IRepositoryProvider;
using Interation.iRepeater.Service.Contract;
using Interation.iRepeater.Service.IServiceProvider;

namespace Interation.iRepeater.Service.ServiceImplementation
{
    public class ProductService : IProductService
    {
        IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public List<ProductContract> GetNewest()
        {
            var products = _productRepository.GetNewest();
            if (products == null) { return null; }
            return products.ConvertAll(refer => refer.ToContractModel());
        }

        public List<ProductContract> GetHottest()
        {
            var products = _productRepository.GetHottest();
            if (products == null) { return null; }
            return products.ConvertAll(refer => refer.ToContractModel());
        }
    }
}
