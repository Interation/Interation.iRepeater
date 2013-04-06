using System.Collections.Generic;
using Interation.iRepeater.Repository.Entity;

namespace Interation.iRepeater.Repository.IRepositoryProvider
{
    public interface IProductRepository
    {
        List<Product> GetNewest();
        List<Product> GetHottest();
    }
}
